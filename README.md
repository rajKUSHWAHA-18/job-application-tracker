# Job Application Tracker

A beginner-friendly React + Spring Boot application for tracking job applications. It uses Spring Data JPA, validation, REST APIs, and H2 by default. A MySQL profile is included for later use.

## Features

- Create, view, edit, and delete job applications
- Track company, job title, job type, location, application date, status, job URL, notes, and interview date
- Search by company or job title
- Filter by status
- Sort by newest application date
- Paginated API results
- Dashboard statistics
- Input validation and readable error responses
- Responsive React browser UI served by Spring Boot in the packaged app
- Vite development server with a proxy to the Spring Boot API
- H2 file database by default; optional MySQL profile
- Basic service-layer unit tests

> Learning-project note: this version is a local, single-user tracker and does not include login or multi-user access control. Do not deploy it publicly with personal data until authentication, authorization, and production security settings have been added.

## Requirements

- JDK 21 (JDK 17 may work after changing the `java.version` property)
- Maven 3.9+ (or use the Maven wrapper if you add one)
- Internet on first build so Maven can download dependencies

Check installations in a terminal:

```bash
java -version
mvn -version
```

## Run on Windows

1. Extract the ZIP.
2. Open the `job-application-tracker` folder in IntelliJ IDEA, Eclipse, or VS Code.
3. Open a terminal in the folder containing `pom.xml`.
4. Run the included script to build and start the application:

```powershell
.\run-windows.bat
```

5. Open `http://localhost:8081` in your browser. If port 8081 is busy, change `PORT` in `run-windows.bat`.

The first build downloads Node.js and npm for the frontend build. The H2 database is stored locally under `./data/jobtracker`; you do not need to install MySQL.

### Frontend development

Run the backend in one terminal:

```powershell
mvn spring-boot:run
```

Then start the Vite dev server in another:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`). API requests are proxied to Spring Boot on port 8081.

## Build a JAR

```bash
mvn clean test
mvn clean package
java -jar target/job-application-tracker-1.0.0.jar
```

## Optional: use MySQL

1. Create a database:

```sql
CREATE DATABASE job_tracker;
```

2. Set environment variables before running (PowerShell):

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/job_tracker"
$env:DB_USERNAME="your_mysql_username"
$env:DB_PASSWORD="your_mysql_password"
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

Do not commit real passwords to GitHub. The MySQL profile reads credentials from environment variables.

## REST API

Base path: `/api/applications`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/applications` | List applications; optional `search`, `status`, `page`, `size` |
| GET | `/api/applications/{id}` | Get one application |
| POST | `/api/applications` | Create an application |
| PUT | `/api/applications/{id}` | Update an application |
| DELETE | `/api/applications/{id}` | Delete an application |
| GET | `/api/applications/stats` | Dashboard statistics |

Example create request:

```json
{
  "company": "Example Technologies",
  "jobTitle": "Java Developer",
  "jobType": "Full-time",
  "location": "Lucknow / Hybrid",
  "status": "APPLIED",
  "applicationDate": "2026-10-14",
  "interviewDate": null,
  "jobUrl": "https://example.com/jobs/123",
  "notes": "Applied through the company careers page."
}
```

Allowed statuses: `WISHLIST`, `APPLIED`, `ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`.

## Project structure

```text
src/main/java/com/rk/jobtracker/
  JobApplicationTrackerApplication.java
  controller/JobApplicationController.java
  dto/JobApplicationRequest.java
  dto/DashboardStats.java
  exception/GlobalExceptionHandler.java
  model/JobApplication.java
  model/ApplicationStatus.java
  repository/JobApplicationRepository.java
  service/JobApplicationService.java
src/main/resources/
  application.properties
  application-mysql.properties
frontend/
  package.json
  vite.config.js
  src/main.jsx
  src/styles.css
src/test/java/.../JobApplicationServiceTest.java
```

## Before publishing to GitHub

- Read and understand the code; change the README to describe your own work.
- Add your own features and explain them honestly in interviews.
- Do not commit secrets or personal data.
- Consider adding authentication, user-specific records, reminders, Docker, and deployment as future improvements.
