# Local Development Setup Guide

This guide provides detailed instructions on how to set up and run the BoothieCall Elegancia Playground locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Git**: For cloning the repository.
- **Docker Desktop**: For the recommended containerized setup.
- **Node.js** (v18+): For manual frontend setup.
- **PHP** (v8.1+) & **Composer**: For manual backend setup.

---

## 🐳 Option 1: Docker Setup (Recommended)

The easiest way to run the application is using Docker. This spins up the Frontend, Backend, and Database services automatically.

### 1. Clone the Repository
```bash
git clone https://github.com/axlwolf/boothiecall-elegancia-playground.git
cd boothiecall-elegancia-playground
```

### 2. Start the Application
Run the following command in the root directory:
```bash
docker-compose up -d --build
```

### 3. Access the Services
Once the containers are running, you can access:

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8082](http://localhost:8082)
- **phpMyAdmin**: [http://localhost:8081](http://localhost:8081)
- **MySQL**: Port `3307`

### 4. Stop the Application
To stop the containers:
```bash
docker-compose down
```

---

## 🛠️ Option 2: Manual Setup

If you prefer to run services individually on your machine.

### Backend Setup (PHP)

1.  **Navigate to the backend directory**:
    ```bash
    cd backend-php
    ```

2.  **Install dependencies**:
    ```bash
    composer install
    ```

3.  **Configure Environment**:
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    *Edit `.env` to match your local database credentials.*

4.  **Start the PHP Server**:
    ```bash
    php -S localhost:8080 -t public
    ```

### Frontend Setup (React)

1.  **Navigate to the root directory** (if not already there):
    ```bash
    cd ..
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    The app will be available at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Running Tests

To ensure everything is working correctly, you can run the test suite.

### Frontend Tests (Vitest)
```bash
npm run test:run
```

### Backend Tests (PHPUnit)
```bash
cd backend-php
./vendor/bin/phpunit
```

---

## ❓ Troubleshooting

-   **Port Conflicts**: If ports 3000, 8082, or 3307 are in use, modify `docker-compose.yml` to use different host ports.
-   **Database Connection**: Ensure your `.env` file in `backend-php` matches the Docker service names if running via Docker, or localhost if running manually.
