<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=trip_booking_v2', 'root', '');
$userId = 3;
$today = new DateTime();

echo "Aujourd'hui (DateTime): " . $today->format('Y-m-d H:i:s') . "\n\n";

// Simuler la requête du backend
$stmt = $pdo->prepare('SELECT b.id, b.trip_id, t.title, ts.start_date FROM bookings b JOIN trips t ON b.trip_id = t.id JOIN trip_sessions ts ON b.trip_session_id = ts.id WHERE b.user_id = ? AND b.status = ?');
$stmt->execute([$userId, 'CONFIRMED']);

$eligibleBookings = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $startDateStr = $row['start_date'];
    $startDate = new DateTime($startDateStr);
    
    echo "Booking {$row['id']}: {$row['title']} | Début: $startDateStr\n";
    echo "  start_date (DateTime): " . $startDate->format('Y-m-d H:i:s') . "\n";
    echo "  today >= start_date ? " . ($today >= $startDate ? 'OUI' : 'NON') . "\n";
    
    if ($today >= $startDate) {
        $eligibleBookings[] = $row;
    }
}

echo "\nTotal éligibles: " . count($eligibleBookings) . "\n";
