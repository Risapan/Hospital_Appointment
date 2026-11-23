# Hospital Appointment System

A full-stack management system designed to streamline how hospitals handle doctor scheduling, patient appointments, and administrative tasks. The goal was to build a role-based platform where patients can book slots, doctors can manage their day, and admins can keep the whole operation running smoothly.

## How it works

The system is split into four distinct roles to keep things organized:

- **Patients**: Can browse departments and doctors, book appointments, manage their own profiles, and get notifications.
- **Doctors**: Have their own portal to view their upcoming appointments and manage their availability/schedules.
- **Receptionists**: Focus on the daily operation—searching for patients and managing the overall daily schedule.
- **Admins**: Full control over the system. They manage doctors, departments, hospitals, and users, and can dive into audit logs for security and tracking.

## Tech Stack

### Backend
- **Java & Spring Boot**: The core logic and API.
- **Spring Security & JWT**: For role-based access and secure authentication.
- **MongoDB**: Used for flexible data storage of patient records and appointment logs.
- **Maven**: For dependency management.

### Frontend
- **React & TypeScript**: For a type-safe, scalable UI.
- **Vite**: To keep the development process fast.
- **Tailwind CSS**: For a clean, modern, and responsive design.
- **Lucide React**: For the iconography.

## Getting Started

### Run everything with Docker (recommended)
The only requirement is **Docker Desktop**. One command builds and starts MongoDB, the Spring Boot backend and the React frontend:

```bash
cp .env.example .env          # optional: change ports, passwords and the JWT secret
docker compose up -d --build
```

| Service  | Container           | URL                                   |
|----------|---------------------|---------------------------------------|
| Frontend | `hospital_frontend` | http://localhost:5174                 |
| Backend  | `hospital_backend`  | http://localhost:8081/api             |
| MongoDB  | `hospital_mongo`    | `mongodb://hospital:hospital_pass@localhost:27018/?authSource=admin` (Compass) |

Containers start in order: MongoDB, then the backend once MongoDB is healthy, then the frontend once the backend is healthy. The frontend's nginx proxies `/api` to the backend, so the browser talks to one origin. Data is kept in the `mongo_data` volume.

Demo accounts are created on first start: `admin@hospital.lk` / `admin123`, `receptionist@hospital.lk` / `receptionist123`, `patient@hospital.lk` / `patient123`, and doctors with password `doctor123`.

```bash
docker compose ps             # status and health
docker compose logs -f backend
docker compose down           # stop (keeps data)
docker compose down -v        # stop and delete the database
```

The MongoDB username and password are applied only when the `mongo_data` volume is first created. After changing them in `.env`, run `docker compose down -v` once.

### Backend Setup (without Docker)
1. Make sure you have **Java 21** and **Maven** installed.
2. Ensure **MongoDB** is running locally on port 27017.
3. Navigate to the backend folder:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
The server will start on `http://localhost:8081`.

### Frontend Setup (without Docker)
1. Make sure you have **Node.js** installed.
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
The app will be available at `http://localhost:5174`.

## Project Structure
- `/backend`: Contains the Spring Boot source code, security configs, and MongoDB models.
- `/frontend`: Contains the React source code, organized by pages (admin, doctor, patient, public, receptionist).
