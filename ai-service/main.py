from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connexions DB
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'trip_booking_db'
}

MONGO_CLIENT = MongoClient('mongodb://localhost:27017/')
mongo_db = MONGO_CLIENT['trip_booking']

def get_mysql_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

def build_trip_feature_vector(trip: Dict) -> np.ndarray:
    """Construit un vecteur de caractéristiques pour un voyage"""
    # Features: destinations (one-hot), categories, duration, price
    # Simplifié pour l'exemple
    features = []
    
    # Duration normalisée (0-1)
    features.append(min(trip['duration_days'] / 30, 1.0))
    
    # Price normalisé (log)
    price = float(trip['base_price'])
    features.append(np.log1p(price) / 10)  # Normalisation approximative
    
    # Destinations (one-hot simplifié - ici juste le nombre)
    features.append(len(trip.get('destinations', [])) / 5)
    
    # Categories (one-hot simplifié)
    features.append(len(trip.get('categories', [])) / 3)
    
    return np.array(features)

def get_user_interactions(user_id: int) -> Dict:
    """Récupère les interactions de l'utilisateur"""
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Bookings
    cursor.execute("""
        SELECT trip_id FROM bookings 
        WHERE user_id = %s AND status = 'CONFIRMED'
    """, (user_id,))
    booked_trips = [row['trip_id'] for row in cursor.fetchall()]
    
    # Saved trips
    cursor.execute("""
        SELECT trip_id FROM saved_trips WHERE user_id = %s
    """, (user_id,))
    saved_trips = [row['trip_id'] for row in cursor.fetchall()]
    
    # Events depuis MongoDB (optionnel)
    events = mongo_db.events.find({'user_id': user_id})
    viewed_trips = [e['trip_id'] for e in events if e.get('event_type') == 'view']
    
    cursor.close()
    conn.close()
    
    return {
        'booked': booked_trips,
        'saved': saved_trips,
        'viewed': viewed_trips
    }

@app.get("/")
def read_root():
    return {"message": "AI Recommendation Service"}

@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: int, limit: int = 10):
    """Génère des recommandations pour un utilisateur"""
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Récupérer tous les voyages actifs
        cursor.execute("""
            SELECT t.*, 
                   GROUP_CONCAT(DISTINCT d.id) as destination_ids,
                   GROUP_CONCAT(DISTINCT c.id) as category_ids
            FROM trips t
            LEFT JOIN trip_destinations td ON t.id = td.trip_id
            LEFT JOIN destinations d ON td.destination_id = d.id
            LEFT JOIN trip_categories tc ON t.id = tc.trip_id
            LEFT JOIN categories c ON tc.category_id = c.id
            WHERE t.is_active = 1
            GROUP BY t.id
        """)
        all_trips = cursor.fetchall()
        
        if not all_trips:
            return {"recommendations": []}
        
        # Récupérer les interactions utilisateur
        interactions = get_user_interactions(user_id)
        user_trip_ids = set(interactions['booked'] + interactions['saved'] + interactions['viewed'][:10])
        
        if not user_trip_ids:
            # Pas d'historique: retourner les plus populaires
            cursor.execute("""
                SELECT trip_id, COUNT(*) as bookings_count
                FROM bookings
                WHERE status = 'CONFIRMED'
                GROUP BY trip_id
                ORDER BY bookings_count DESC
                LIMIT %s
            """, (limit,))
            popular = cursor.fetchall()
            return {"recommendations": [{"trip_id": r['trip_id'], "score": 0.8} for r in popular]}
        
        # Construire les vecteurs de features
        trip_vectors = {}
        trip_ids = []
        
        for trip in all_trips:
            trip['destinations'] = [int(x) for x in str(trip['destination_ids']).split(',') if x.isdigit()] if trip['destination_ids'] else []
            trip['categories'] = [int(x) for x in str(trip['category_ids']).split(',') if x.isdigit()] if trip['category_ids'] else []
            vector = build_trip_feature_vector(trip)
            trip_vectors[trip['id']] = vector
            trip_ids.append(trip['id'])
        
        # Construire le vecteur utilisateur (moyenne pondérée)
        user_trip_vectors = []
        for tid in user_trip_ids:
            if tid in trip_vectors:
                user_trip_vectors.append(trip_vectors[tid])
        
        if not user_trip_vectors:
            return {"recommendations": []}
        
        user_vector = np.mean(user_trip_vectors, axis=0)
        
        # Calculer similarité cosinus
        recommendations = []
        for tid in trip_ids:
            if tid not in user_trip_ids:  # Exclure les voyages déjà réservés
                similarity = cosine_similarity([user_vector], [trip_vectors[tid]])[0][0]
                recommendations.append({
                    "trip_id": tid,
                    "score": float(similarity)
                })
        
        # Trier par score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        cursor.close()
        conn.close()
        
        return {"recommendations": recommendations[:limit]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/events")
def log_event(event: Dict):
    """Enregistre un événement utilisateur (view, click, save)"""
    try:
        mongo_db.events.insert_one({
            'user_id': event.get('user_id'),
            'trip_id': event.get('trip_id'),
            'event_type': event.get('event_type'),  # view, click, save, booking
            'timestamp': event.get('timestamp')
        })
        return {"status": "logged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)