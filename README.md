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

### Backend Setup
1. Make sure you have **Java 17+** and **Maven** installed.
2. Ensure **MongoDB** is running locally on port 27017.
3. Navigate to the backend folder:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
The server will start on `http://localhost:8080`.

### Frontend Setup
1. Make sure you have **Node.js** installed.
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
The app will be available at `http://localhost:5173`.

## Project Structure
- `/backend`: Contains the Spring Boot source code, security configs, and MongoDB models.
- `/frontend`: Contains the React source code, organized by pages (admin, doctor, patient, public, receptionist).
