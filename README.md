# Flux AI (Cyborg-DB)

Flux AI is a full-stack document Q&A app built for the **CyborgDB Hackathon**. It performs Retrieval-Augmented Generation (RAG) over user-uploaded files and stores embeddings in **encrypted CyborgDB indexes** for secure similarity search.

### Index

- [Flux AI (Cyborg-DB)](#flux-ai-cyborg-db)
    - [Index](#index)
  - [Screenshots](#screenshots)
  - [Healthcare \& HIPAA](#healthcare--hipaa)
  - [CyborgDB Highlights](#cyborgdb-highlights)
  - [Tech Stack](#tech-stack)
  - [Key Features](#key-features)
  - [Architecture](#architecture)
    - [Container Topology](#container-topology)
    - [File Ingestion Flow (Indexing)](#file-ingestion-flow-indexing)
    - [Chat + Retrieval + Streaming](#chat--retrieval--streaming)
  - [Quickstart (Docker)](#quickstart-docker)
    - [Prerequisites](#prerequisites)
    - [1) Clone](#1-clone)
    - [2) Configuration](#2-configuration)
    - [3) Start](#3-start)
  - [Migrations + Seed](#migrations--seed)
  - [Local Development (No Docker)](#local-development-no-docker)
  - [Encrypted Vector Search (How It Works Here)](#encrypted-vector-search-how-it-works-here)
  - [Troubleshooting](#troubleshooting)

## Screenshots

![Flux AI – session + file panel](screenshots/img1.jpeg)
![Flux AI – attachment-scoped query + streaming](screenshots/img2.jpeg)
![Flux AI – response with citations + engine logs](screenshots/img3.jpeg)
![Flux AI – citation-driven file viewer](screenshots/img4.jpeg)

## Healthcare & HIPAA

Flux AI is built for **healthcare document understanding** (e.g., medical reports, discharge summaries, clinical references) with a security model that supports workflows involving **PHI**.

HIPAA note: this project is designed with **HIPAA-aligned security considerations** in mind (encryption, access controls, and minimized data exposure), but HIPAA compliance is ultimately a **program/process** (policies, BAAs, access governance, auditing, retention, incident response). Validate requirements with your compliance/legal team before handling real PHI.

Privacy- and compliance-relevant design choices:

- **Encrypted vector search (CyborgDB)**: embeddings are stored and queried in encrypted CyborgDB indexes.
- **Per-session isolation**: separate encrypted indexes per session help compartmentalize data.
- **Scoped retrieval**: attachment selection limits which documents are used for context.
- **Audit-friendly UX**: “engine events” provide an execution trail for ingestion/retrieval steps.

## CyborgDB Highlights

This project is designed to highlight CyborgDB capabilities in a practical RAG system:

- **Encrypted vector storage**: embeddings live inside CyborgDB, not in plaintext tables.
- **Per-session isolation**: each chat session gets its own encrypted index (`session_<sessionId>`), reducing blast radius and simplifying access control.
- **Secure retrieval**: similarity search runs against encrypted vectors using an `ENCRYPTION_KEY`-backed index key.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **RAG / LLM**: Google GenAI (embeddings + generation)
- **Vector store**: CyborgDB (encrypted indexes)
- **Database**: Postgres + Prisma
- **Ingestion**: Python FastAPI service (file/URL → Markdown)
- **Streaming**: Server-Sent Events (SSE)

## Key Features

- **End-to-end RAG ingestion**: upload → convert to Markdown → chunk → embed → encrypted upsert → chunk metadata persisted.
- **Attachment-scoped retrieval**: users select which files to use; only those documents are searched.
- **Streaming chat (SSE)**: token streaming to the UI, plus a separate stream of “engine events” for logs/progress.
- **Multi-format ingestion**: PDFs, Office docs (DOCX/PPTX/XLSX), images, and common text formats (based on backend allow-list).
- **Chunk viewer + citations**: responses can reference chunks; UI can open the source document.
- **Auth**: JWT auth, with optional Google OAuth and a **guest login** path.

## Architecture

### Container Topology

```mermaid
flowchart LR
  U[User Browser] -->|HTTP :3009| FE[Next.js Frontend\ncontainer: flux-frontend]
  FE -->|HTTP| BE[Express Backend\ncontainer: flux-backend\nport: 3008]

  BE -->|SQL| PG[(Postgres\ncontainer: flux-postgres)]
  BE -->|HTTP /process-file| MD[Python Markdown Service\ncontainer: flux-python-md-service\nFastAPI :3001]
  BE -->|Cyborg SDK| CY[(CyborgDB Service\ncontainer: flux-cyborgdb\n:8000)]

  BE -->|volume| UP[(uploads volume)]
  MD -->|volume| UP
```

### File Ingestion Flow (Indexing)

```mermaid
sequenceDiagram
  autonumber
  participant FE as Frontend
  participant BE as Backend (Express)
  participant Q as In-memory Queue
  participant MD as Python MD Service (FastAPI)
  participant E as Embeddings (Google GenAI)
  participant CY as CyborgDB Index (encrypted)
  participant PG as Postgres (Prisma)

  FE->>BE: POST /chat/upload (multipart: file, sessionId)
  BE->>PG: Create Attachment record
  BE->>Q: Enqueue job: process-file {attachmentId, sessionId}
  FE->>BE: GET /chat/attachments/:id/stream (SSE)

  Q->>BE: Run Orchestrator job
  BE->>CY: Create index if missing (indexName=session_<uuid>, indexKey=ENCRYPTION_KEY)
  BE->>MD: POST /process-file {file_path: <absolute uploads path>}
  MD-->>BE: markdown_content
  BE->>BE: Chunk markdown (chunkSize=1000, overlap=200)
  BE->>E: Embed chunks (text-embedding-004)
  E-->>BE: vectors[]
  BE->>CY: Upsert encrypted vectors
  BE->>PG: Insert ChunkData (content + metadata + vectorId)
  BE-->>FE: SSE progress updates (processing -> completed)
```

### Chat + Retrieval + Streaming

```mermaid
sequenceDiagram
  autonumber
  participant FE as Frontend
  participant BE as Backend (Express)
  participant CY as CyborgDB
  participant PG as Postgres
  participant LLM as Gemini (generation)

  FE->>BE: POST /chat/sessions/:id/messages {content, attachmentIds}
  BE-->>FE: SSE stream begins (user_message)

  alt attachmentIds provided
    BE->>CY: query() on per-session encrypted index
    BE->>PG: Fetch ChunkData for returned vectorIds
    BE->>BE: Build prompt with excerpts + page markers
  end

  BE->>LLM: generateContentStream()
  loop tokens
    LLM-->>BE: token
    BE-->>FE: SSE token
  end

  BE->>PG: Persist assistant message
  BE-->>FE: SSE done
```


## Quickstart (Docker)

### Prerequisites

- Docker Desktop
- Google GenAI API key (for embeddings + generation)

### 1) Clone

```bash
git clone https://github.com/arpan-lol/cyborg-db.git
cd cyborg-db
```

### 2) Configuration

Create a `.env` at the repo root:

```bash
copy .env.example .env
```

Required variables (high-level):

- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_GENAI_API_KEY`
- `CYBORG_BASE_URL`, `CYBORGDB_API_KEY`
- `ENCRYPTION_KEY` (base64)

Common local values (Docker Compose):

- Frontend: `http://localhost:3009`
- Backend: `http://localhost:3008`

Generate an encryption key (PowerShell):

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 3) Start

```bash
docker compose up --build
```

Services (local):

- Frontend: `http://localhost:3009`
- Backend: `http://localhost:3008`

## Migrations + Seed

Prisma migrations are not automatically executed on container startup. Run once after the first boot:

```bash
docker compose exec backend npx prisma migrate deploy --schema=src/prisma/schema.prisma
docker compose exec backend npm run prisma:seed
```

The seed creates/updates a guest user (`guest@fluxai`).

## Local Development (No Docker)

If you prefer running services directly:

- Backend:
  ```bash
  cd backend
  npm install
  npm run dev
  ```

- Frontend:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

- Python Markdown service:
  ```bash
  cd backend/src/scripts
  pip install -r requirements.txt
  python api.py
  ```

You will also need:

- A running Postgres matching `DATABASE_URL`.
- A running CyborgDB service (the repo uses `cyborginc/cyborgdb-service:latest`).

## Encrypted Vector Search (How It Works Here)

- CyborgDB index is created **per chat session**:
  - index name: `session_<sessionId>` (UUID hyphens replaced with underscores)
  - index type: `ivfflat`, dimension `768`
- The encryption key (`indexKey`) is loaded from `ENCRYPTION_KEY` (base64).
- CyborgDB stores vectors; Postgres stores chunk text + metadata (`ChunkData`).

## Troubleshooting

- File upload errors:
  - Backend enforces 50MB max upload size via Multer.
  - Python service enforces 100MB max per file for `/process-file`.
- If vector operations fail, verify:
  - `ENCRYPTION_KEY` is set and base64-decodable.
  - `CYBORG_BASE_URL` points to the CyborgDB service (`http://cyborgdb:8000` in Docker).
- If the app starts but auth fails:
  - Ensure `JWT_SECRET` is set.
  - For Google OAuth, ensure `backend/google-creds.json` exists and `REDIRECT_URI` matches the Google Console configuration.

