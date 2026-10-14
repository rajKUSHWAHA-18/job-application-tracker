@echo off
echo Starting Job Application Tracker...
set "PORT=8081"
where mvn >nul 2>nul
if errorlevel 1 (
  echo Maven was not found. Install Maven or open this project in IntelliJ IDEA and run the main class.
  pause
  exit /b 1
)

echo Building the React frontend and Spring Boot application...
mvn package
if errorlevel 1 (
  echo Build failed. Check the Maven output above.
  pause
  exit /b 1
)

echo Using port %PORT% (change PORT before running if needed)
java -jar target\job-application-tracker-1.0.0.jar
pause
