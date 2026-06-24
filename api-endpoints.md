# API Endpoints

Base URL:

```text
http://localhost:<PORT>
```

All API routes are under `/api` except the root health check.

## Health Check

| Method | Endpoint | Description                     |
| ------ | -------- | ------------------------------- |
| GET    | `/`      | Confirms the server is running. |

## Auth

The backend stores the JWT in an HttpOnly `token` cookie after login.

| Method | Endpoint             | Auth | Description                     |
| ------ | -------------------- | ---- | ------------------------------- |
| POST   | `/api/auth/register` | No   | Create a user account.          |
| POST   | `/api/auth/login`    | No   | Log in and set the auth cookie. |
| GET    | `/api/auth/me`       | Yes  | Get the logged-in user.         |
| POST   | `/api/auth/sign-out` | No   | Clear the auth cookie.          |

Register body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "gender": "male",
  "profilePicture": "https://example.com/profile.jpg",
  "email": "john@example.com",
  "rawPassword": "password123",
  "phoneNumber": "09123456789",
  "role": "user"
}
```

Login body:

```json
{
  "email": "john@example.com",
  "rawPassword": "password123"
}
```

## Outfits

| Method | Endpoint           | Auth | Description       |
| ------ | ------------------ | ---- | ----------------- |
| POST   | `/api/outfits`     | Yes  | Create an outfit. |
| GET    | `/api/outfits`     | Yes  | Get all outfits.  |
| GET    | `/api/outfits/:id` | No   | Get one outfit.   |
| PATCH  | `/api/outfits/:id` | Yes  | Update an outfit. |
| DELETE | `/api/outfits/:id` | Yes  | Delete an outfit. |

Create/update body:

```json
{
  "name": "Princess Costume",
  "category": "Fantasy",
  "description": "Pink princess costume with accessories",
  "imageURL": "https://example.com/image.jpg",
  "variants": [
    {
      "color": "Pink",
      "sizes": [
        {
          "size": "M",
          "stock": 5
        }
      ]
    }
  ],
  "price": 1500,
  "rentalPrice": 350
}
```

## Image Upload

| Method | Endpoint                 | Auth | Description                     |
| ------ | ------------------------ | ---- | ------------------------------- |
| POST   | `/api/cloudinary/upload` | Yes  | Upload one image to Cloudinary. |

Use `multipart/form-data` with a file field named `image`.

Response:

```json
{
  "url": "https://res.cloudinary.com/..."
}
```

## Cart

| Method | Endpoint                                  | Auth | Description                             |
| ------ | ----------------------------------------- | ---- | --------------------------------------- |
| POST   | `/api/cart`                               | No   | Add item snapshots to a user's cart.    |
| GET    | `/api/cart/:userId`                       | No   | Get a user's cart.                      |
| DELETE | `/api/cart/:userId/item/:variantId/:size` | No   | Remove a cart item by variant and size. |

Add to cart body:

```json
{
  "userId": "USER_ID",
  "items": [
    {
      "outfitId": "OUTFIT_ID",
      "variantId": "VARIANT_ID",
      "size": "M",
      "quantity": 1,
      "name": "Princess Costume",
      "imageURL": "https://example.com/image.jpg",
      "price": 350,
      "category": "Fantasy"
    }
  ]
}
```

## Orders

Orders are for bought items and use `type: "buy"`.

| Method | Endpoint                   | Auth | Description                |
| ------ | -------------------------- | ---- | -------------------------- |
| POST   | `/api/orders/create`       | No   | Create a buy order.        |
| GET    | `/api/orders/user/:userId` | No   | Get buy orders for a user. |

Create order body:

```json
{
  "userID": "USER_ID",
  "type": "purchase",
  "items": [
    {
      "outfitId": "OUTFIT_ID",
      "variantId": "VARIANT_ID",
      "size": "M",
      "color": "Pink",
      "quantity": 1,
      "name": "Princess Costume",
      "category": "Fantasy",
      "imageURL": "https://example.com/image.jpg",
      "price": 1500
    }
  ],
  "totalAmount": 1500,
  "status": "pending",
  "payment": {
    "method": "cash"
  }
}
```

Order statuses: `pending`, `paid`, `shipped`, `delivered`, `cancelled`.

## Rents

Rents are for rental items and use `type: "rent"`.

| Method | Endpoint          | Auth | Description                              |
| ------ | ----------------- | ---- | ---------------------------------------- |
| POST   | `/api/rents`      | Yes  | Create a rent record.                    |
| GET    | `/api/rents`      | Yes  | Get all rent records.                    |
| GET    | `/api/rents/user` | Yes  | Get rent records for the logged-in user. |
| PATCH  | `/api/rents/:id`  | Yes  | Update a rent record.                    |

Create rent body:

```json
{
  "userID": "USER_ID",
  "type": "rent",
  "items": [
    {
      "outfitId": "OUTFIT_ID",
      "variantId": "VARIANT_ID",
      "size": "M",
      "color": "Pink",
      "quantity": 1,
      "name": "Princess Costume",
      "category": "Fantasy",
      "imageURL": "https://example.com/image.jpg",
      "price": 350
    }
  ],
  "rentalDays": 3,
  "pickupTime": "2026-05-10T09:00:00.000Z",
  "returnTime": "2026-05-13T09:00:00.000Z",
  "totalAmount": 1050,
  "status": "pending",
  "payment": {
    "method": "cash"
  }
}
```

Update rent body:

```json
{
  "updateData": {
    "status": "returned"
  }
}
```

Rent statuses: `pending`, `active`, `overdue`, `returned`, `cancelled`.

## Admin/User Order Views

These routes combine buy orders and rents for dashboard views.

| Method | Endpoint                                     | Auth | Description                             |
| ------ | -------------------------------------------- | ---- | --------------------------------------- |
| GET    | `/api/users/orders`                          | No   | Get all orders and rents.               |
| GET    | `/api/users/orders/:id`                      | No   | Get all orders and rents for one user.  |
| GET    | `/api/users/orders/details/:id`              | No   | Get one order or rent by ID.            |
| PATCH  | `/api/users/orders/details/:id/status`       | No   | Update the status of one order or rent. |
| PATCH  | `/api/users/orders/details/:id/payment/paid` | No   | Mark one order or rent payment as paid. |

Update status body:

```json
{
  "status": "delivered"
}
```

## Common Responses

Most success responses return either a message, the requested data, or both:

```json
{
  "message": "Success message",
  "data": {}
}
```

Most errors return:

```json
{
  "message": "Error message"
}
```

Common status codes:

| Code | Meaning                          |
| ---- | -------------------------------- |
| 200  | Request succeeded.               |
| 201  | Resource created.                |
| 400  | Missing or invalid request data. |
| 401  | Login required.                  |
| 404  | Resource not found.              |
| 500  | Server error.                    |
