# Taiwan Stock Fund Screening System - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Overview
This API provides endpoints for managing Taiwan stock fund net buy data, user subscriptions, and notifications.

---

## Endpoints

### Health Check

#### GET /health
Check if the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Stocks Module

### Get Top 30 Stocks

#### GET /stocks/top30
Retrieve the top 30 stocks by net buy amount.

**Query Parameters:**
- `limit` (optional): Number of results per page (default: 30)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "symbol": "2330",
      "name": "Taiwan Semiconductor Manufacturing Company",
      "buyAmount": 5000000000,
      "buyShares": 1000000,
      "sellAmount": 2000000000,
      "sellShares": 400000,
      "netBuyAmount": 3000000000,
      "closePrice": 500,
      "changePercent": 2.5,
      "rank": 1,
      "volume": 50000000,
      "date": "2024-01-01T00:00:00Z"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Stock by Symbol

#### GET /stocks/:symbol
Retrieve details for a specific stock.

**Path Parameters:**
- `symbol` (required): Stock symbol (e.g., "2330")

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "symbol": "2330",
    "name": "Taiwan Semiconductor Manufacturing Company",
    "buyAmount": 5000000000,
    "closePrice": 500,
    "changePercent": 2.5
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Stock History

#### GET /stocks/:symbol/history
Retrieve historical data for a specific stock.

**Path Parameters:**
- `symbol` (required): Stock symbol

**Query Parameters:**
- `days` (optional): Number of days to retrieve (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01T00:00:00Z",
      "buyAmount": 5000000000,
      "changePercent": 2.5
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Subscriptions Module

### Create Subscription

#### POST /subscriptions
Create a new user subscription for notifications.

**Request Body:**
```json
{
  "email": "user@example.com",
  "subscriptionType": "all",
  "symbol": null,
  "thresholdChange": 5
}
```

**Parameters:**
- `email` (required): User email address
- `subscriptionType` (required): "all" for all stocks or "symbol" for specific stock
- `symbol` (conditional): Required if subscriptionType is "symbol"
- `thresholdChange` (optional): Price change percentage threshold for alerts (default: 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "subscriptionType": "all",
    "enabled": true,
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "message": "Subscription created successfully",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get All Subscriptions

#### GET /subscriptions
Retrieve all user subscriptions with pagination.

**Query Parameters:**
- `limit` (optional): Results per page (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "subscriptionType": "all",
      "enabled": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 100,
    "totalCount": 5,
    "totalPages": 1
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Subscription by Email

#### GET /subscriptions/email/:email
Get a specific subscription by email address.

**Path Parameters:**
- `email` (required): User email address

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "subscriptionType": "all",
    "enabled": true
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Subscription by ID

#### GET /subscriptions/:id
Get a specific subscription by ID.

**Path Parameters:**
- `id` (required): Subscription ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "subscriptionType": "all",
    "enabled": true
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Subscriptions by Symbol

#### GET /subscriptions/symbol/:symbol
Get all subscriptions for a specific stock symbol.

**Path Parameters:**
- `symbol` (required): Stock symbol

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "subscriptionType": "symbol",
      "symbol": "2330",
      "enabled": true
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Active Subscriptions

#### GET /subscriptions/active
Retrieve all active (enabled) subscriptions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "subscriptionType": "all",
      "enabled": true
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Update Subscription

#### PUT /subscriptions/:id
Update a subscription.

**Path Parameters:**
- `id` (required): Subscription ID

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "subscriptionType": "symbol",
  "symbol": "2454",
  "thresholdChange": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "newemail@example.com",
    "subscriptionType": "symbol",
    "symbol": "2454",
    "enabled": true
  },
  "message": "Subscription updated successfully",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Enable Subscription

#### PATCH /subscriptions/:id/enable
Enable a subscription.

**Path Parameters:**
- `id` (required): Subscription ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "enabled": true
  },
  "message": "Subscription enabled successfully",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Disable Subscription

#### PATCH /subscriptions/:id/disable
Disable a subscription.

**Path Parameters:**
- `id` (required): Subscription ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "enabled": false
  },
  "message": "Subscription disabled successfully",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Delete Subscription

#### DELETE /subscriptions/:id
Delete a subscription.

**Path Parameters:**
- `id` (required): Subscription ID

**Response:**
```json
{
  "success": true,
  "message": "Subscription deleted successfully",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Common Error Codes:
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `422`: Unprocessable Entity - Validation failed
- `500`: Internal Server Error - Server error
- `503`: Service Unavailable - Service not available

---

## Authentication

Currently, the API does not require authentication. Authentication will be added in future versions.

---

## Rate Limiting

Rate limiting is not currently implemented. It will be added in production deployments.

---

## Scheduled Jobs

The system includes automated scheduled jobs:

1. **Crawler Job** - Runs at 08:30, 13:00, and 15:00 (weekdays only)
   - Crawls fund net buy data from TWSE

2. **Processor Job** - Runs at 16:00 (weekdays only)
   - Processes and analyzes daily data
   - Generates statistics and rankings

3. **Notification Job** - Runs daily at 16:30
   - Sends daily summary emails
   - Checks and sends alert notifications every 5 minutes

---

## Data Types

### Stock Object
```typescript
{
  id?: number
  symbol: string          // Stock symbol
  name: string           // Company name
  buyAmount: number      // Fund buy amount in NTD
  buyShares: number      // Fund buy shares count
  sellAmount?: number    // Fund sell amount in NTD
  sellShares?: number    // Fund sell shares count
  netBuyAmount?: number  // Net buy amount
  closePrice?: number    // Stock closing price
  changePercent?: number // Price change percentage
  rank?: number          // Ranking among top stocks
  volume?: number        // Trading volume
  industry?: string      // Industry classification
  date: Date            // Date of data
}
```

### Subscription Object
```typescript
{
  id?: number
  email: string                           // User email
  subscriptionType: 'all' | 'symbol'     // Subscription type
  symbol?: string                         // Stock symbol (if type is 'symbol')
  thresholdChange?: number                // Alert threshold
  enabled?: boolean                       // Enable/disable subscription
  createdAt?: Date                        // Creation timestamp
  updatedAt?: Date                        // Last update timestamp
}
```

---

## Examples

### cURL Examples

**Get top 30 stocks:**
```bash
curl -X GET "http://localhost:3000/api/stocks/top30"
```

**Create subscription:**
```bash
curl -X POST "http://localhost:3000/api/subscriptions" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "subscriptionType": "all",
    "thresholdChange": 5
  }'
```

**Get subscription by email:**
```bash
curl -X GET "http://localhost:3000/api/subscriptions/email/user@example.com"
```

**Update subscription:**
```bash
curl -X PUT "http://localhost:3000/api/subscriptions/1" \
  -H "Content-Type: application/json" \
  -d '{
    "thresholdChange": 3
  }'
```

**Delete subscription:**
```bash
curl -X DELETE "http://localhost:3000/api/subscriptions/1"
```

---

## Support

For issues or questions, please open an issue on the GitHub repository.
