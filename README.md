# 📦 Last-Mile Delivery System – Architecture & Design

## 🧭 Overview

This system facilitates on-demand deliveries with real-time tracking, service selection, automated rider matching, and M-PESA payouts. It serves end-users requesting deliveries and drivers fulfilling them.

---

## 🧱 Project Initialization (Docker-Based Setup)

### 🗂️ Folder Structure

```text
lastmile-delivery/
├── apps/
│   ├── frontend/        # SvelteKit app
│   └── backend/         # NestJS API server
├── prisma/              # Prisma schema & migrations
├── docker-compose.yml   # Compose setup
├── .env                 # Shared environment vars
└── README.md
```

### 🐳 Docker Setup

#### `apps/frontend/Dockerfile`

```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

#### `apps/backend/Dockerfile`

```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  frontend:
    build: ./apps/frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_BACKEND_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    build: ./apps/backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/lastmile
      - JWT_SECRET=supersecret
    depends_on:
      - db

  db:
    image: postgres:15
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: lastmile
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 🚀 Quick Start

```bash
docker-compose up --build
```

Access:

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:3000](http://localhost:3000)

---

## 🧩 Split Sequence Flows by User Stories

### 🧑‍💼 User Login Flow

**Goal:** Authenticate a user and issue a JWT token.

```mermaid
sequenceDiagram
    participant FrontEnd
    participant Backend
    participant Database

    FrontEnd->>Backend: login(email, password)
    Backend->>Database: validate credentials
    Database-->>Backend: return user data
    Backend-->>FrontEnd: JWT token + user profile
```

---

### 📍 Initiate Delivery & Show Options

**Goal:** User provides pickup/dropoff and gets service type and cost options.

```mermaid
sequenceDiagram
    participant FrontEnd
    participant Backend
    participant GeoService
    participant PriceService
    participant Database

    FrontEnd->>Backend: initiateDelivery(pickup, dropoff)
    Backend->>GeoService: geocode pickup & dropoff
    GeoService-->>Backend: return lat/lng
    Backend->>Database: fetch available services
    Backend->>PriceService: calculate cost estimates
    PriceService-->>Backend: return pricing data
    Backend-->>FrontEnd: show service options + prices
```

---

### 🚴‍♂️ Confirm Delivery & Assign Driver

**Goal:** User selects an option, driver accepts, and ETA is shared.

```mermaid
sequenceDiagram
    participant FrontEnd
    participant Backend
    participant Database
    participant DriverApp

    FrontEnd->>Backend: confirmDelivery(optionSelected)
    Backend->>Database: find nearby drivers
    loop until accepted
        Backend-->>DriverApp: notify new delivery
        DriverApp-->>Backend: accept request
    end
    Backend->>Database: assign driver
    Backend-->>FrontEnd: confirm + ETA
```

---

### 💳 Authorize Payment

**Goal:** Reserve payment for trip prior to driver assignment.

```mermaid
sequenceDiagram
    participant Backend
    participant PaymentService
    participant Database

    Backend->>PaymentService: authorize payment (wallet/card)
    PaymentService-->>Backend: hold funds or validate balance
    Backend->>Database: store payment intent
```

---

### 🛰️ Real-Time Tracking

**Goal:** Update client every 10s with live driver location.

```mermaid
sequenceDiagram
    participant DriverApp
    participant Backend
    participant Database
    participant FrontEnd

    loop every 10s
        DriverApp-->>Backend: send location
        Backend->>Database: update tracking data
        Backend-->>FrontEnd: push driver position + ETA
    end
```

---

### 🔔 Notifications (Pickup & Pre-dropoff)

**Goal:** Inform the user of key delivery milestones.

```mermaid
sequenceDiagram
    participant DriverApp
    participant Backend
    participant NotificationService

    DriverApp->>Backend: arrived at pickup
    Backend->>NotificationService: send pickup notification

    alt ETA ≤ 5 minutes
        Backend->>NotificationService: send pre-dropoff alert
    end
```

---

### 📦 Delivery Confirmation & Completion

**Goal:** Mark delivery complete and process payment.

```mermaid
sequenceDiagram
    participant DriverApp
    participant Backend
    participant NotificationService
    participant FrontEnd
    participant PaymentService
    participant Database

    DriverApp->>Backend: mark delivery complete
    Backend->>Database: update delivery status
    Backend->>NotificationService: notify user
    FrontEnd->>Backend: user confirms receipt

    Backend->>PaymentService: finalize charge
    PaymentService-->>Backend: success
    Backend->>Database: store final transaction
```

---

### 💸 Rider Payout via Daraja API

**Goal:** Pay driver via M-PESA or track cash collection.

```mermaid
sequenceDiagram
    participant Backend
    participant DarajaAPI
    participant DriverApp
    participant Database

    alt Wallet/Card
        Backend->>DarajaAPI: initiate B2C payout
        DarajaAPI-->>Backend: payout result
        Backend->>Database: log payout
        Backend-->>DriverApp: confirm payout
    else Cash on Delivery
        Backend->>Database: record commission owed
        Backend-->>DriverApp: confirm cash handling
    end
```

---

## 🔁 Flow Diagrams per User Story

### 1. Login Flow

```mermaid
graph TD
    A[User Enters Credentials] --> B[Send to Backend]
    B --> C[Backend Validates with DB]
    C --> D[Return JWT + Profile to Frontend]
```

### 2. Delivery Option Flow

```mermaid
graph TD
    A[User Enters Pickup/Dropoff] --> B[Geocode with OSM]
    B --> C[Fetch Available Services]
    C --> D[Calculate Cost]
    D --> E[Display Options to User]
```

### 3. Rider Matching

```mermaid
graph TD
    A[User Confirms Option] --> B[Backend Finds Nearby Drivers]
    B --> C[Push Request to Drivers]
    C --> D[First to Accept is Assigned]
    D --> E[ETA Shown to User]
```

### 4. Real-Time Tracking

```mermaid
graph TD
    A[Driver Sends Location] --> B[Backend Updates DB]
    B --> C[Push to Client]
    C --> D[Update Map/ETA]
```

### 5. Notifications

```mermaid
graph TD
    A[Driver Arrives Pickup] --> B[Trigger Pickup Alert]
    A2[ETA ≤ 5min] --> C[Send Pre-Dropoff Alert]
```

### 6. Completion & Payment

```mermaid
graph TD
    A[Driver Marks Complete] --> B[Update Delivery Status]
    B --> C[Notify User]
    C --> D[User Confirms Receipt]
    D --> E[Finalize Payment]
```

### 7. Rider Payout (Daraja)

```mermaid
graph TD
    A[Payment Successful] --> B[Trigger Daraja B2C]
    B --> C[MPESA API Response]
    C --> D[Log & Notify Driver]
    alt Cash on Delivery
        A2[COD Recorded] --> E[Mark Commission Owed]
        E --> F[Notify Driver of Cash Handling]
```
