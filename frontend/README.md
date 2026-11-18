# Pathfinder - Placement Intelligence Platform

The React frontend for the AI-Powered Placement Intelligence Platform. The Java Spring Boot API is in `../backend`. Local AI runs with Ollama; student progress is stored in MySQL.

## Run locally

Install the free local tools: Java 25+, Maven, Node.js, MySQL Community Server, and Ollama. In a terminal, download the default open model once:

```powershell
ollama pull qwen2.5:3b
```

In MySQL Workbench or the MySQL command line, run [setup-local-mysql.sql](../backend/database/setup-local-mysql.sql) to create the local database, app user, and student-account table. Replace its sample password before running it. From the project root, configure the API:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `DB_USERNAME=pathfinder_app` and the same `DB_PASSWORD` in `backend\.env`. Start the API:

```powershell
cd backend
mvn spring-boot:run
```

Use Maven to launch the API; starting `PlacementApiApplication` with only `target\classes` omits Spring Boot and its dependencies.

In a second terminal, start the React frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. The API listens on port 8080 and Vite proxies `/api` requests to it. Microphone recording requires browser permission; localhost is treated as a secure context.

The app's AI requests run against Ollama at `http://localhost:11434`; no paid API key is used. Change `OLLAMA_MODEL` in `backend\.env` to a model you have pulled. Browser speech recognition availability varies by browser; when it is unavailable, type or edit the answer transcript before requesting feedback.

## Database and API testing

The backend creates/updates its development tables using JPA. For production, replace `spring.jpa.hibernate.ddl-auto=update` with versioned database migrations before deploying. On first sign-in, the API creates a student-account row for the normalized USN; progress is then saved in MySQL under that USN. USN-only access does not verify identity: anyone can enter another student's USN and access its progress. Do not store confidential information until password-based authentication is added.

Import [Pathfinder Local API.postman_collection.json](../backend/postman/Pathfinder%20Local%20API.postman_collection.json) into Postman Free to try health, progress, interview, code review, resume, and plan endpoints.

To run backend tests and build the frontend:

```powershell
cd backend
mvn test
cd ..\frontend
npm run build
```

## Current features

- Placement-preparation dashboard
- Dashboard count of unique student USNs registered
- Searchable coding-practice set with 15 problems and difficulty filters
- Browser-persisted problem completion tracking
- USN sign-in with student records created on first login
- Ten-question interactive skill assessment for fundamentals
- Local Ollama interviewer generates Java, SQL, DSA, and HR questions at selectable difficulty
- Mock interview recordings with browser speech recognition and local-Ollama rubric-based answer feedback
- AI code reviewer explains issues, complexity, and possible improvements without executing code
- AI resume analyzer reviews pasted resume text against an optional job description
- Personalized seven-day learning plan using goals, focus areas, available study time, and completed problems
- MySQL-backed, USN-scoped progress sync with browser-local fallback

## Free/local development and deployment

Model inference runs on your own computer, so there is no per-request AI API charge; the model download and inference use local disk, memory, and CPU/GPU. Browser speech-recognition implementations vary and may use a browser vendor's service. Only the resulting transcript is sent to Ollama; recorded audio is not uploaded or saved by this app. Remove secrets and personal details before using AI features.

GitHub is the intended source-code remote; this workspace currently has no remote or deployment credentials configured. The root `Dockerfile` prepares the app for Railway with a separate persistent MySQL service, as described below. Cloud AI stays disabled until a compatible model service is configured; the local Ollama installation is not reachable by a cloud deployment.

The app does not yet include password-based authentication, resume file uploads, or code execution. Student code is reviewed as text and is never executed.

## Online deployment with Railway

The root `Dockerfile` builds the React app and packages it with Spring Boot, so one Railway web service can serve both the website and `/api`. The app uses Railway's injected `PORT` value and `/api/health` for the deployment health check. AI modules stay disabled until a compatible model is configured. The online version saves student USNs, coding progress/drafts, and assessment answers; interview responses and resume text are not saved.

1. Push this project to a GitHub repository you control, then create a Railway project from that repository. Keep the service root at the repository root so Railway detects the `Dockerfile`.
2. Add a Railway MySQL service named `MySQL`. In the web service settings, set:

   ```text
   DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?serverTimezone=UTC
   DB_USERNAME=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   ```

3. Set the health check path to `/api/health`, generate a public domain, and deploy. Keep database credentials in Railway variables; never commit them.
4. The Railway database starts empty. Local MySQL data is not copied automatically; export/import it separately only after reviewing and backing it up.

Railway's free plan has limited included usage and may not be sufficient for an always-on app. Check current pricing and enable the persistent database backups you need before using real student data. USN-only access still lets anyone who knows a USN view or change that student's saved progress.
