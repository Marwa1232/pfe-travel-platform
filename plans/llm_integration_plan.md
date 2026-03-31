# LLM Integration Plan for TripPFE - Recommendations & Intelligent Search

## Current State Analysis

### Existing Components:
1. **SearchAiController** (`/api/ai/search`) - Basic OpenAI GPT-3.5 integration for query parsing
2. **AIData Entity** - Database table for storing AI recommendations (currently unused)
3. **.env** - Missing `OPENAI_API_KEY` configuration

### Current Limitations:
- Only parses search queries to extract destination/price/category
- No actual trip recommendations
- No personalization based on user history
- No caching of AI responses
- No fallback when API is unavailable

---

## Recommended Architecture

### Option A: Enhanced OpenAI Integration (Recommended)

**Best for:** Quick implementation, moderate cost, good results

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Search Bar   │  │ Recommendations│  │ Personalized Section │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘ │
└─────────┼──────────────────┼──────────────────────┼─────────────┘
          │                  │                      │
          ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Symfony Backend                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │ SearchAi       │  │ Recommendation │  │ UserPreference   │ │
│  │ Controller     │  │ Service        │  │ Service          │ │
│  └───────┬────────┘  └───────┬────────┘  └────────┬─────────┘ │
│          │                   │                     │            │
│  ┌───────▼───────────────────▼─────────────────────▼────────┐ │
│  │              LLM Service (OpenAI GPT-4)                    │ │
│  └───────────────────────────┬────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────────┐ │
│  │              AIData Repository (Caching)                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Option B: Hybrid - OpenAI + Local Embeddings

**Best for:** Better semantic search, reduced API costs

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     Symfony Backend                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │ Semantic       │  │ LLM            │  │ Recommendation   │ │
│  │ Search         │  │ Generation     │  │ Engine           │ │
│  └───────┬────────┘  └───────┬────────┘  └────────┬─────────┘ │
│          │                   │                     │            │
│  ┌───────▼───────┐  ┌───────▼───────┐  ┌────────▼─────────┐  │
│  │ ChromaDB /    │  │ OpenAI        │  │ AIData           │  │
│  │ pgvector      │  │ API           │  │ (PostgreSQL)     │  │
│  └───────────────┘  └───────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Enhanced Search (Week 1)

1. **Add OpenAI API Key to .env**
   ```
   OPENAI_API_KEY=sk-...
   ```

2. **Create LLM Service** (`src/Service/LlmService.php`)
   - Centralize OpenAI API calls
   - Add error handling and retry logic
   - Implement response caching

3. **Enhance SearchAiController**
   - Add trip filtering based on AI response
   - Return structured trip results
   - Add confidence scores

### Phase 2: Recommendations (Week 2)

1. **Create RecommendationService**
   - Track user preferences (interests, budget, location)
   - Generate personalized trip suggestions
   - Use collaborative filtering + content-based

2. **Add User Preference Tracking**
   - Store search history
   - Track booking patterns
   - Monitor browsing behavior

3. **Create API Endpoints**
   - `GET /api/recommendations/personalized`
   - `GET /api/recommendations/similar/{tripId}`
   - `GET /api/recommendations/trending`

### Phase 3: Intelligence & Learning (Week 3)

1. **Implement Feedback Loop**
   - User can like/dislike recommendations
   - Store feedback in AIData table
   - Improve recommendations over time

2. **Add Admin Dashboard**
   - View AI recommendation metrics
   - Adjust recommendation weights
   - A/B testing support

---

## API Endpoints to Create

### 1. Intelligent Search (Enhance existing)
```php
POST /api/ai/search
// Input: { "query": " beach vacation under 500 TND" }
// Output: { "trips": [...], "filters": {...}, "ai_analysis": "..." }
```

### 2. Personalized Recommendations
```php
GET /api/recommendations/personalized
// Headers: Authorization: Bearer <token>
// Output: { "recommendations": [...], "reason": "Based on your interest in beaches" }
```

### 3. Similar Trips
```php
GET /api/recommendations/similar/{tripId}
// Output: { "similar_trips": [...], "common_features": ["beach", "family-friendly"] }
```

### 4. Trending Trips
```php
GET /api/recommendations/trending
// Output: { "trending": [...], "trending_in": "Tunisia" }
```

---

## Technology Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| LLM | OpenAI GPT-4o | Best price/performance, supports JSON |
| Vector DB | PostgreSQL + pgvector | Already using PostgreSQL |
| Caching | Doctrine + Redis | Reduce API costs |
| API Client | Symfony HttpClient | Already available |

---

## Cost Estimation

| Usage | GPT-3.5 | GPT-4o |
|-------|---------|--------|
| 1,000 searches/month | ~$1 | ~$5 |
| 10,000 searches/month | ~$10 | ~$50 |
| 100,000 searches/month | ~$100 | ~$500 |

**Recommendation:** Start with GPT-3.5 for search, GPT-4o for recommendations

---

## Files to Create/Modify

### New Files:
- `src/Service/LlmService.php` - Central LLM handling
- `src/Service/RecommendationService.php` - Recommendation logic
- `src/Controller/Api/RecommendationApiController.php` - New endpoints
- `src/Dto/` - Request/Response DTOs

### Modified Files:
- `.env` - Add OPENAI_API_KEY
- `SearchAiController.php` - Enhance existing search
- `AIDataRepository.php` - Add query methods
- `frontend/src/services/api.ts` - Add recommendation endpoints

---

## Next Steps

1. **Get OpenAI API Key** - Create account at openai.com
2. **Configure .env** - Add OPENAI_API_KEY
3. **Create LLM Service** - Implement basic OpenAI integration
4. **Enhance Search** - Improve existing SearchAiController
5. **Add Recommendations** - Build recommendation engine

---

## Alternative: Free/Open Source Options

If budget is a concern:

1. **Ollama** (Local LLM)
   - Run Llama3 locally
   - No API costs
   - Requires good server hardware

2. **Hugging Face Inference API**
   - Free tier available
   - Good for simple tasks

3. **Azure OpenAI**
   - Enterprise pricing
   - Better data privacy

---

**Recommendation:** Start with **Option A (Enhanced OpenAI)** using GPT-4o for best results with reasonable cost.
