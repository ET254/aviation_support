# API Reference

## Base URL

```
http://localhost:5000/api
https://api.example.com/api
```

## Authentication

All endpoints except login/register require JWT authentication in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Response Format

All responses follow this standard format:

```json
{
  "success": true,
  "data": { /* response payload */ },
  "error": null,
  "timestamp": "2026-07-16T13:03:26.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* additional context */ }
  },
  "timestamp": "2026-07-16T13:03:26.000Z"
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `409`: Conflict
- `422`: Unprocessable entity
- `500`: Internal server error

## Authentication Endpoints

### POST /auth/login

Authenticate user with email and password.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "role": "PILOT"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /auth/register

Register new user.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PILOT"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "newuser@example.com",
    "role": "PILOT"
  }
}
```

### POST /auth/refresh

Refresh JWT token.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## Stations Endpoints

### GET /stations

List all weather stations.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by station code or name
- `region`: Filter by region

**Request:**
```bash
curl http://localhost:5000/api/stations?page=1&limit=20 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stations": [
      {
        "id": "station-1",
        "code": "HKJK",
        "name": "Jomo Kenyatta International",
        "latitude": -1.3188,
        "longitude": 36.9283,
        "elevation": 1624,
        "region": "Nairobi",
        "category": "INTERNATIONAL"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

### GET /stations/{stationId}

Get station details.

**Request:**
```bash
curl http://localhost:5000/api/stations/station-1 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "station-1",
    "code": "HKJK",
    "name": "Jomo Kenyatta International",
    "latitude": -1.3188,
    "longitude": 36.9283,
    "elevation": 1624,
    "region": "Nairobi",
    "category": "INTERNATIONAL",
    "airportOperator": "JKIA",
    "contactEmail": "ops@jkia.co.ke",
    "timezone": "Africa/Nairobi"
  }
}
```

### POST /stations

Create new station (admin only).

**Request:**
```bash
curl -X POST http://localhost:5000/api/stations \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "HKJK",
    "name": "Jomo Kenyatta International",
    "latitude": -1.3188,
    "longitude": 36.9283,
    "elevation": 1624,
    "region": "Nairobi",
    "category": "INTERNATIONAL"
  }'
```

## Weather Data Endpoints

### GET /weather/current/{stationId}

Get current weather for a station.

**Request:**
```bash
curl http://localhost:5000/api/weather/current/station-1 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stationId": "station-1",
    "temperature": 22.5,
    "dewPoint": 15.5,
    "humidity": 65,
    "windSpeed": 12,
    "windDirection": 230,
    "windGust": 18,
    "visibility": 8000,
    "cloudBase": 2500,
    "cloudType": "SCATTERED",
    "precipitationType": "NONE",
    "pressure": 1015,
    "timestamp": "2026-07-16T13:03:26.000Z"
  }
}
```

### GET /weather/historical

Get historical weather data.

**Query Parameters:**
- `stationId`: Station ID (required)
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)
- `limit`: Number of records (default: 100)

**Request:**
```bash
curl "http://localhost:5000/api/weather/historical?stationId=station-1&startDate=2026-07-15&endDate=2026-07-16" \
  -H "Authorization: Bearer <token>"
```

## Decision Support Endpoints

### POST /decision-support/evaluate

Evaluate weather conditions for operational decision.

**Request:**
```bash
curl -X POST http://localhost:5000/api/decision-support/evaluate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "station-1",
    "observation": {
      "temperature": 32,
      "windSpeed": 35,
      "visibility": 1800,
      "cloudBase": 400,
      "crosswindComponent": 24
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "decision": "HOLD",
    "status": "RESTRICTED",
    "colour": "ORANGE",
    "overallRiskScore": 70,
    "summary": "operational decision HOLD with an overall risk score of 70.",
    "recommendations": {
      "pilots": [
        "Monitor density altitude carefully",
        "Crosswind limits approaching maximum"
      ],
      "atc": ["Restrict high-performance operations"],
      "dispatch": ["Increase dispatch intervals"],
      "meteorologists": ["Monitor pressure systems"],
      "airportOperations": ["Activate high-wind procedures"],
      "maintenance": ["Check flight control serviceability"]
    },
    "confidence": 0.85,
    "evaluatedAt": "2026-07-16T13:03:26.000Z"
  }
}
```

### GET /decision-support/dashboard/{stationId}

Get dashboard summary for station.

**Request:**
```bash
curl http://localhost:5000/api/decision-support/dashboard/station-1 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stationId": "station-1",
    "currentDecision": { /* same as evaluate response */ },
    "forecast": { /* forecast data */ },
    "alerts": [ /* active alerts */ ],
    "impacts": { /* operational impacts */ }
  }
}
```

## Forecast Endpoints

### GET /forecasts/{stationId}

Get forecast for station.

**Query Parameters:**
- `hours`: Forecast hours (default: 24)
- `includeDetailed`: Include detailed parameters

**Request:**
```bash
curl "http://localhost:5000/api/forecasts/station-1?hours=24" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stationId": "station-1",
    "validTime": "2026-07-16T13:03:26.000Z",
    "forecast": [
      {
        "validTime": "2026-07-16T14:00:00.000Z",
        "temperature": 23,
        "windSpeed": 13,
        "visibility": 9000,
        "cloudBase": 2700,
        "precipitationProbability": 10
      }
    ]
  }
}
```

### POST /forecasts/import

Import NetCDF forecast file (admin only).

**Request:**
```bash
curl -X POST http://localhost:5000/api/forecasts/import \
  -H "Authorization: Bearer <admin-token>" \
  -F "file=@forecast.nc" \
  -F "stationId=station-1"
```

## Impact Assessment Endpoints

### GET /impacts/{stationId}

Get operational impacts for station.

**Request:**
```bash
curl http://localhost:5000/api/impacts/station-1 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stationId": "station-1",
    "pilots": [
      "Reduce crosswind operations",
      "Increase approach spacing"
    ],
    "atc": [
      "Restrict high-performance operations",
      "Increase separation minima"
    ],
    "dispatch": [
      "Increase dispatch intervals",
      "Brief crews on conditions"
    ],
    "meteorologists": [
      "Monitor pressure systems",
      "Update forecasts"
    ],
    "airportOperations": [
      "Activate high-wind procedures",
      "Position emergency equipment"
    ],
    "maintenance": [
      "Check flight control serviceability",
      "Inspect structural integrity"
    ]
  }
}
```

## Alert Endpoints

### GET /alerts

Get alerts for current user.

**Query Parameters:**
- `status`: ACTIVE, RESOLVED, ACKNOWLEDGED
- `severity`: MONITOR, CAUTION, WARNING, CRITICAL
- `limit`: Number of records (default: 20)

**Request:**
```bash
curl "http://localhost:5000/api/alerts?status=ACTIVE&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-1",
        "type": "WEATHER",
        "severity": "CAUTION",
        "message": "Low cloud base forecast for 0600-1200 UTC",
        "stationId": "station-1",
        "status": "ACTIVE",
        "createdAt": "2026-07-16T13:03:26.000Z",
        "expiresAt": "2026-07-16T18:03:26.000Z"
      }
    ]
  }
}
```

### PUT /alerts/{alertId}/acknowledge

Acknowledge alert.

**Request:**
```bash
curl -X PUT http://localhost:5000/api/alerts/alert-1/acknowledge \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"note": "Acknowledged by pilot"}'
```

## Report Endpoints

### POST /reports

Generate operational report (admin only).

**Request:**
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DAILY_OPERATIONS",
    "stationId": "station-1",
    "date": "2026-07-16"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "report-1",
    "type": "DAILY_OPERATIONS",
    "status": "GENERATED",
    "url": "http://localhost:5000/reports/report-1.pdf"
  }
}
```

### GET /reports/{reportId}

Download report.

**Request:**
```bash
curl -O http://localhost:5000/api/reports/report-1.pdf \
  -H "Authorization: Bearer <token>"
```

## User Management Endpoints

### GET /users/profile

Get current user profile.

**Request:**
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PILOT",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### PUT /users/profile

Update user profile.

**Request:**
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "phoneNumber": "+254-123-456-7890"
  }'
```

## Health & Status Endpoints

### GET /health/live

Liveness probe.

**Request:**
```bash
curl http://localhost:5000/health/live
```

**Response:**
```json
{
  "status": "ok"
}
```

### GET /health/ready

Readiness probe.

**Request:**
```bash
curl http://localhost:5000/health/ready
```

**Response:**
```json
{
  "status": "ready",
  "database": "connected"
}
```

## Webhooks

### Weather Alert Webhook

Subscribe to weather alerts:

```bash
curl -X POST http://localhost:5000/api/webhooks/subscribe \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["WEATHER_ALERT", "DECISION_CHANGE"],
    "stationIds": ["station-1"]
  }'
```

Webhook payload:

```json
{
  "event": "WEATHER_ALERT",
  "timestamp": "2026-07-16T13:03:26.000Z",
  "data": {
    "stationId": "station-1",
    "severity": "CAUTION",
    "message": "Low cloud base forecast"
  }
}
```

## Rate Limiting

Rate limits are applied per user:

- Standard: 100 requests per minute
- Admin: 1000 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1626433406
```

## Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_CREDENTIALS` | Login failed |
| `TOKEN_EXPIRED` | JWT token expired |
| `UNAUTHORIZED` | Missing or invalid token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Unexpected server error |

## Pagination

List endpoints support pagination:

```bash
curl "http://localhost:5000/api/stations?page=2&limit=50"
```

Response includes pagination metadata:

```json
{
  "data": { /* items */ },
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```
