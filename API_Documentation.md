# SolarCapital Backend API Documentation

---

## AuthController (`/auth`)

### POST `/auth/register`
**Purpose:** Register a new user. Sends an OTP to the provided email for verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourPassword",
  "fullName": "John Doe",
  "contact": "9876543210"
}
```
**Response:**
- 200 OK: "Registration successful. OTP sent to email."
- 400 Bad Request: "Email already registered"

**Authentication:** Not required.

---

### POST `/auth/verify-otp`
**Purpose:** Verify the OTP sent to the user's email during registration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
**Response:**
- 200 OK: "OTP verified. You can now log in."
- 400 Bad Request: "Invalid or expired OTP"

**Authentication:** Not required.

---

### POST `/auth/login`
**Purpose:** Authenticate a user and return a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourPassword"
}
```
**Response:**
- 200 OK: `{ "token": "jwt-token-here" }`
- 400 Bad Request: "User not found" or "Invalid credentials"

**Authentication:** Not required.

---

## KycController (`/kyc`)

### POST `/kyc/submit`
**Purpose:** Submit KYC details for the authenticated user.

**Request Header:**
- Authorization: Bearer `<token>`

**Request Body:**
- KYC object (fields depend on your KYC entity)

**Response:**
- 200 OK: "KYC submitted and pending approval."
- 400 Bad Request: "User not found"
- 401 Unauthorized: "Missing or invalid Authorization header"

**Authentication:** Required.

---

## AdminKycController (`/admin/kyc`)

### POST `/admin/kyc/{id}/approve`
**Purpose:** Approve a KYC request by ID.

**Path Parameter:**
- id: KYC record ID

**Response:**
- 200 OK: "KYC approved."
- 400 Bad Request: "KYC not found"

**Authentication:** Admin only (enforced elsewhere).

---

### POST `/admin/kyc/{id}/reject`
**Purpose:** Reject a KYC request by ID.

**Path Parameter:**
- id: KYC record ID

**Response:**
- 200 OK: "KYC rejected."
- 400 Bad Request: "KYC not found"

**Authentication:** Admin only (enforced elsewhere).

---

## ProjectController (`/api/projects`)

### GET `/api/projects/active`
**Purpose:** List all active projects.

**Response:**
- 200 OK: Array of Project objects

**Authentication:** Not required.

---

### POST `/api/projects/admin`
**Purpose:** Create a new project (admin only).

**Request Body:**
- Project object (fields: name, location, energyCapacity, subscriptionPrice, etc.)

**Response:**
- 200 OK: Project object (created)

**Authentication:** Admin only (enforced elsewhere).

---

### PUT `/api/projects/admin/{id}`
**Purpose:** Update an existing project (admin only).

**Path Parameter:**
- id: Project ID

**Request Body:**
- Project object (fields to update)

**Response:**
- 200 OK: Project object (updated)
- 404 Not Found: If project does not exist

**Authentication:** Admin only (enforced elsewhere).

---

### PATCH `/api/projects/admin/{id}/pause`
**Purpose:** Pause a project (admin only).

**Path Parameter:**
- id: Project ID

**Response:**
- 200 OK: Project object (paused)
- 404 Not Found: If project does not exist

**Authentication:** Admin only (enforced elsewhere).

---

## SubscriptionController (`/api/subscriptions`)

### POST `/api/subscriptions`
**Purpose:** Initiate a subscription for a project (mock Cashfree order creation).

**Request Header:**
- Authorization: Bearer `<token>`

**Request Parameter:**
- projectId: Long

**Response:**
- 200 OK: `{ "paymentOrderId": "...", "paymentLink": "..." }`
- 400 Bad Request: "Project not found"
- 401 Unauthorized: "User not found"

**Authentication:** Required.

---

### POST `/api/subscriptions/webhook`
**Purpose:** Handle payment status webhook (mocked).

**Request Parameters:**
- orderId: String
- status: String ("SUCCESS" or "FAILED")

**Response:**
- 200 OK: "Webhook processed"
- 400 Bad Request: "Subscription not found"

**Authentication:** Not required (should be secured in production).

---

### GET `/api/subscriptions/history`
**Purpose:** Get the authenticated user's subscription history.

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: Array of Subscription objects
- 401 Unauthorized: "User not found"

**Authentication:** Required.

---

## EnergyController (`/api/energy`)

### POST `/api/energy/record`
**Purpose:** Admin: Record monthly kWh for a project and calculate rewards for all subscribers.

**Request Parameters:**
- projectId: Long
- month: int
- year: int
- kWh: double

**Response:**
- 200 OK: "Rewards calculated and logged for all subscribed users."
- 400 Bad Request: "Project not found"

**Authentication:** Admin only (enforced elsewhere).

---

### GET `/api/energy/rewards/history`
**Purpose:** Get reward history for the authenticated user.

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: Array of RewardHistory objects
- 401 Unauthorized: "User not found"

**Authentication:** Required.

---

## EngagementController (`/engagement`)

### POST `/engagement/reinvest`
**Purpose:** Reinvest credits into a project.

**Request Header:**
- Authorization: Bearer `<token>`

**Request Parameters:**
- projectId: Long
- amount: BigDecimal

**Response:**
- 200 OK: "Reinvested X credits in project Y"
- 400 Bad Request: "Project not found" or "Insufficient credits"
- 401 Unauthorized: "Unauthorized"

**Authentication:** Required.

---

### POST `/engagement/donate`
**Purpose:** Donate credits to a project.

**Request Header:**
- Authorization: Bearer `<token>`

**Request Parameters:**
- projectId: Long
- amount: BigDecimal

**Response:**
- 200 OK: "Donated X credits to project Y"
- 400 Bad Request: "Project not found" or "Insufficient credits"
- 401 Unauthorized: "Unauthorized"

---

### POST `/engagement/gift`
**Purpose:** Gift credits to another user.

**Request Header:**
- Authorization: Bearer `<token>`

**Request Parameters:**
- recipientEmail: String
- amount: BigDecimal

**Response:**
- 200 OK: "Gifted X credits to recipient"
- 400 Bad Request: "Recipient not found" or "Insufficient credits"
- 401 Unauthorized: "Unauthorized"

---

### GET `/engagement/logs`
**Purpose:** Get credit transfer logs for the authenticated user.

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: Array of logs (outflows and inflows)
- 401 Unauthorized: "Unauthorized"

---

## WalletController (`/wallet`)

### POST `/wallet/reward`
**Purpose:** Add a reward for a user (admin or system action).

**Request Header:**
- Authorization: Bearer `<token>`

**Request Body:**
- RewardHistory object

**Response:**
- 200 OK: "Reward added successfully"
- 400 Bad Request: "User not found"
- 401 Unauthorized: "Missing or invalid Authorization header"

---

### GET `/wallet/summary`
**Purpose:** Get wallet summary for the authenticated user (total credits, kWh, CO2 saved).

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: `{ "totalCredits": ..., "totalKwh": ..., "co2SavedKg": ... }`
- 400 Bad Request: "User not found"
- 401 Unauthorized: "Missing or invalid Authorization header"

---

### GET `/wallet/ledger`
**Purpose:** Get date-wise reward ledger for the authenticated user.

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: Array of RewardHistory objects (sorted by year, month desc)
- 400 Bad Request: "User not found"
- 401 Unauthorized: "Missing or invalid Authorization header"

---

### GET `/wallet/tds-status`
**Purpose:** Check if TDS should be triggered for the current year.

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: `{ "totalYearly": ..., "tdsRequired": true/false }`
- 400 Bad Request: "User not found"
- 401 Unauthorized: "Missing or invalid Authorization header"

---

### GET `/wallet/dashboard`
**Purpose:** Combined dashboard: summary, ledger, TDS info.

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: `{ "summary": ..., "ledger": ..., "tdsStatus": ... }`

---

### POST `/wallet/send-monthly-summary`
**Purpose:** Send monthly summary PDF to user's email.

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: "Monthly summary PDF sent to user@example.com"
- 400 Bad Request: "User not found"
- 401 Unauthorized: "Missing or invalid Authorization header"
- 500 Internal Server Error: "Failed to generate or send PDF"

---

## WithdrawalController (`/withdrawal`)

### POST `/withdrawal/request`
**Purpose:** Request a withdrawal from wallet.

**Request Header:**
- Authorization: Bearer `<token>`

**Request Body:**
- WithdrawalRequest object

**Response:**
- 200 OK: "Withdrawal successful and paid via Cashfree"
- 400 Bad Request: "User not found", "KYC not approved", "Monthly withdrawal cap exceeded", "Insufficient wallet balance"
- 401 Unauthorized: "Missing or invalid Authorization header"
- 500 Internal Server Error: "Withdrawal failed at payment gateway"

---

### GET `/withdrawal/history`
**Purpose:** Get withdrawal history for the authenticated user.

**Request Header:**
- Authorization: Bearer `<token>`

**Response:**
- 200 OK: Array of WithdrawalRequest objects
- 400 Bad Request: "User not found"
- 401 Unauthorized: "Missing or invalid Authorization header"

--- 