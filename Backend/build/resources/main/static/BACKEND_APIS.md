# Backend API Requirements

This document outlines all the APIs required for the Bench Talent (ATP) Deployment Optimizer backend.

## Base URL
```
/api/v1
```

## Authentication
All APIs should support authentication (JWT tokens or session-based). Include `Authorization: Bearer <token>` header.

---

## 1. Resources APIs

### 1.1 Get All Resources
**GET** `/resources`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`ATP`, `deployed`, `soft-blocked`, `notice`, `leave`, `trainee`, `interview-scheduled`)
- `location` (optional): Filter by location
- `skill` (optional): Filter by skill name
- `search` (optional): Search by name, email, designation, or skills
- `sortBy` (optional): Sort field (`name`, `availabilityDate`, `status`, `location`)
- `sortOrder` (optional): `asc` or `desc` (default: `asc`)

**Response:**
```json
{
  "data": [Resource],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

### 1.2 Get Resource by ID
**GET** `/resources/:id`

**Response:**
```json
{
  "data": Resource
}
```

### 1.6 Get Resource Statistics
**GET** `/resources/stats`

**Response:**
```json
{
  "data": {
    "total": 245,
    "atp": 49,
    "deployed": 160,
    "softBlocked": 20,
    "byStatus": {
      "ATP": 49,
      "deployed": 160,
      "soft-blocked": 20,
      "notice": 10,
      "leave": 5,
      "trainee": 1
    },
    "byLocation": {
      "Bangalore": 100,
      "Mumbai": 80,
      "Delhi": 65
    }
  }
}
```

### 1.7 Get Available Locations
**GET** `/resources/locations`

**Response:**
```json
{
  "data": ["Bangalore", "Mumbai", "Delhi", "Pune"]
}
```

### 1.8 Get Available Skills
**GET** `/resources/skills`

**Response:**
```json
{
  "data": ["React", "Java", "Python", "AWS", "Node.js"]
}
```

### 1.9 Export Resources
**GET** `/resources/export`

**Query Parameters:**
- `format` (optional): `csv` or `xlsx` (default: `csv`)
- `filters`: Same as Get All Resources

**Response:** File download

---

```


## 5. Soft Blocks APIs

### 5.1 Get All Soft Blocks
**GET** `/soft-blocks`

**Query Parameters:**
- `resourceId` (optional): Filter by resource ID
- `active` (optional): Filter by active status (`true`, `false`, `all`)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "data": [SoftBlock],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```


### 5.5 Delete Soft Block
**DELETE** `/soft-blocks/:id`

**Response:**
```json
{
  "message": "Soft block deleted successfully"
}
```

### 5.6 Extend Soft Block
**PATCH** `/soft-blocks/:id/extend`

**Request Body:**
```json
{
  "endDate": "ISO date string"
}
```

**Response:**
```json
{
  "data": SoftBlock
}
```



### 5.8 Get Soft Block Statistics
**GET** `/soft-blocks/stats`

**Response:**
```json
{
  "data": {
    "total": 25,
    "active": 18,
    "expired": 7
  }
}
```

---

## 6. Considerations APIs





## Data Types

### Resource
```typescript
{
  id: Long;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  location: string;
  status: "ATP" | "deployed" | "soft-blocked" | "notice" | "leave" | "trainee" | "interview-scheduled";
  availabilityDate?: string; // ISO date string
  releaseDate?: string; // ISO date string
  skills: Skill[];
  totalExperience: Integer;
  ctc?: number;
  ctcCurrency?: string;
  softBlocks: SoftBlock[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

### Skill
```typescript
{
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  type: "primary" | "secondary";
  yearsOfExperience?: number;
}
```


---

## Error Response Format

All error responses should follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

---

## Notes

1. **Pagination**: All list endpoints should support pagination with `page` and `limit` parameters.

2. **Filtering**: Most list endpoints should support filtering by common fields (status, location, etc.).

3. **Search**: Implement full-text search capabilities where applicable.

4. **Sorting**: Support sorting by multiple fields with `sortBy` and `sortOrder` parameters.

5. **Date Formats**: All dates should be in ISO 8601 format (e.g., `2024-02-05T10:00:00Z`).

6. **Validation**: All input data should be validated before processing.

10. **Audit Logging**: Log all create, update, and delete operations for audit purposes.

11. **Database column should have snake case as naming standard
