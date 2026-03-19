# API Endpoints Documentation

## Base URL

```
http://localhost:PORT/api
```

---

## Authentication Endpoints

### 1. Register User

**POST** `/auth/register`

Creates a new user account.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "gender": "male",
  "profilePicture": "https://example.com/profile.jpg",
  "email": "john@example.com",
  "rawPassword": "password123",
  "phoneNumber": "+1234567890",
  "role": "user"
}
```

**Response (200):**

```json
{
  "message": "Account created successfully."
}
```

---

### 2. Login User

**POST** `/auth/login`

Authenticates a user and returns a token (set as HttpOnly cookie).

**Request Body:**

```json
{
  "email": "john@example.com",
  "rawPassword": "password123"
}
```

**Response (200):**

```json
{
  "message": "Logged in successfully."
}
```

---

### 3. Get Current User

**GET** `/auth/me`

Retrieves the authenticated user's profile.

**Headers:**

```
Authorization: Bearer <token> (or cookie)
```

**Response (200):**

```json
{
  "message": "User fetched successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 4. Sign Out

**POST** `/auth/sign-out`

Signs out the user and clears the authentication cookie.

**Response (200):**

```json
{
  "message": "Successfully signed out"
}
```

---

## Outfit Endpoints

### 1. Create Outfit

**POST** `/outfits`

Creates a new outfit listing.

**Request Body:**

```json
{
  "name": "Princess Costume",
  "category": "Disney",
  "description": "Beautiful princess costume with tiara and accessories",
  "imageURL": "https://example.com/princess.jpg",
  "availableColors": ["pink", "blue", "purple"],
  "availableSizes": ["XS", "S", "M", "L", "XL"],
  "stock": 10,
  "price": 49.99,
  "outfitsSold": 5,
  "outfits_rented": 3
}
```

**Response (200):**

```json
{
  "message": "Outfit created successfully."
}
```

---

### 2. Get All Outfits

**GET** `/outfits`

Retrieves all available outfits.

**Response (200):**

```json
{
  "message": "Outfit fetched successfully.",
  "outfits": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Princess Costume",
      "category": "Disney",
      "description": "Beautiful princess costume with tiara and accessories",
      "availableColors": ["pink", "blue", "purple"],
      "availableSizes": ["XS", "S", "M", "L", "XL"],
      "stock": 10,
      "price": 49.99
    }
  ]
}
```

---

### 3. Update Outfit

**PATCH** `/outfits/:id`

Updates an outfit's information.

**URL Parameters:**

- `id`: Outfit ID

**Request Body:**

```json
{
  "updateData": {
    "price": 59.99,
    "stock": 8,
    "availableColors": ["pink", "blue"]
  }
}
```

**Response (200):**

```json
{
  "message": "Outfit updated successfully.",
  "outfits": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Princess Costume",
    "price": 59.99,
    "stock": 8
  }
}
```

---

### 4. Delete Outfit

**DELETE** `/outfits/:id`

Deletes an outfit from the system.

**URL Parameters:**

- `id`: Outfit ID

**Response (200):**

```json
{
  "message": "Outfit deleted successfully.",
  "outfits": {}
}
```

---

## Rent Endpoints

### 1. Create Rent

**POST** `/rents`

Creates a new rental record.

**Request Body:**

```json
{
  "userID": "507f1f77bcf86cd799439011",
  "rentedItems": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "rentStart": "2026-03-20T10:00:00Z",
  "rentEnd": "2026-03-22T10:00:00Z",
  "pickupTime": "2026-03-20T14:00:00Z",
  "returnTime": "2026-03-22T14:00:00Z",
  "status": "pending"
}
```

**Response (201):**

```json
{
  "message": "Rent created successfully."
}
```

---

### 2. Get All Rents

**GET** `/rents`

Retrieves all rental records.

**Response (200):**

```json
{
  "message": "Rents fetched successfully.",
  "rents": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userID": "507f1f77bcf86cd799439011",
      "rentedItems": ["507f1f77bcf86cd799439012"],
      "rentStart": "2026-03-20T10:00:00Z",
      "rentEnd": "2026-03-22T10:00:00Z",
      "status": "active"
    }
  ]
}
```

---

### 3. Get User's Rents

**GET** `/rents/user`

Retrieves all rentals for the authenticated user.

**Headers:**

```
Authorization: Bearer <token> (or cookie)
```

**Response (200):**

```json
{
  "message": "User rents fetched successfully.",
  "rents": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userID": "507f1f77bcf86cd799439011",
      "rentedItems": ["507f1f77bcf86cd799439012"],
      "rentStart": "2026-03-20T10:00:00Z",
      "rentEnd": "2026-03-22T10:00:00Z",
      "status": "active"
    }
  ]
}
```

---

### 4. Update Rent

**PATCH** `/rents/:id`

Updates a rental record's information.

**URL Parameters:**

- `id`: Rent ID

**Request Body:**

```json
{
  "updateData": {
    "status": "completed",
    "returnTime": "2026-03-22T15:30:00Z"
  }
}
```

**Response (200):**

```json
{
  "message": "Rent updated successfully.",
  "rent": {
    "_id": "507f1f77bcf86cd799439014",
    "userID": "507f1f77bcf86cd799439011",
    "status": "completed"
  }
}
```

---

## Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Authentication required  |
| 404  | Not Found - Resource not found          |
| 500  | Server Error - Internal error           |

---

## Notes

- All timestamps should be in ISO 8601 format (UTC)
- Authentication is required for endpoints marked with 🔒
- Most endpoints return error responses with status 500 and error messages
