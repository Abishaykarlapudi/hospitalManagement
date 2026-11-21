# DocTime - Hospital Management System

A multi-portal Hospital Management System built with **Spring Boot 4 / Java 21** (Backend REST API on port 1080) and **React 19 + Vite** (Frontend Portals).

---

## 3 Dedicated Logins & Portals

The application provides 3 role-based portals with individual logins, tailored capabilities, and distinct links/ports:

| Role / Portal | Direct Link | Default Port | Dedicated Features & Login Details |
| :--- | :--- | :--- | :--- |
| **Hospital Admin Portal** | [`/hospital`](http://localhost:5173/hospital) | **5173** | **Login:** `admin@doctime.com` / `admin123`<br>• Full system oversight (Doctors, Patients, Appointments)<br>• Add/Edit/Delete physicians & patients<br>• Master appointment calendar & KPI analytics |
| **Doctor Portal** | [`/doctor`](http://localhost:5173/doctor) | **5174** | **Login:** Doctor's registered email (or one-click selector)<br>• Doctor's clinical schedule (`/appointment/doctor/{id}`)<br>• One-click status actions: **Confirm**, **Complete**, **Cancel**<br>• Reschedule patient appointment date & time |
| **Patient / User Portal** | [`/patient`](http://localhost:5173/patient) | **5175** | **Login / Register:** Patient email or 1-click registration<br>• Browse verified doctors by specialization<br>• Book consultations with doctor, date & time picker<br>• Track appointment confirmation & cancel bookings |
| **Portal Gateway Hub** | [`/`](http://localhost:5173/) | **5173** | Central interactive landing page connecting all 3 portals with direct launching and quick switching. |

---

## How to Run

### 1. Start the Backend API (Spring Boot)
Ensure MySQL is running with database `batch78` (or update `application.properties`).

```powershell
cd HospitalManagement-DocTime
.\mvnw.cmd spring-boot:run
```
- **Backend API URL:** `http://localhost:1080`
- **Swagger UI:** `http://localhost:1080/swagger-ui/index.html`

---

### 2. Start the Frontend

#### Option A: Unified Gateway (All Portals on One Port via Distinct Links)
```powershell
cd doctime-frontend
npm run dev
```
Open your browser at:
- Gateway Hub: `http://localhost:5173/`
- Hospital Admin Portal: `http://localhost:5173/hospital`
- Doctor Portal: `http://localhost:5173/doctor`
- Patient Portal: `http://localhost:5173/patient`

#### Option B: Run Portals on Different Ports
Open separate terminals for each portal:

```powershell
# Terminal 1 - Hospital Admin Portal on Port 5173
cd doctime-frontend
npm run dev:hospital

# Terminal 2 - Doctor Portal on Port 5174
cd doctime-frontend
npm run dev:doctor

# Terminal 3 - Patient Portal on Port 5175
cd doctime-frontend
npm run dev:patient
```
