# Contexta Setup & Environment Configuration Guide

This guide walks you through setting up, configuring, and running **Contexta** for local development, production builds, and containerized deployments.

---

## 📋 Prerequisites

Before getting started, make sure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (v9+), `pnpm` (v8+), or `bun`
- **Modern Browser**: Chrome, Edge, Firefox, or Safari with Web Crypto API and IndexedDB support

---

## ⚡ Quickstart

### 1. Clone the Repository

```bash
git clone https://github.com/SRD1510/Contexta.git
cd Contexta
```

### 2. Install Dependencies

Using `npm`:
```bash
npm install
```

Or using `bun`:
```bash
bun install
```

### 3. Launch Development Server

```bash
npm run dev
```

The application will start with Hot Module Replacement (HMR) at:
```
http://localhost:5173
```

---

## 🔐 Environment Variables & API Key Security

Contexta is designed with a **privacy-first, client-side architecture**. You do not need to expose API keys on a remote server or commit them to source control.

### Option A: Configure in UI (Recommended)
1. Open the application at `http://localhost:5173`.
2. Click the **Settings** icon (gear) in the top-right header.
3. Enter your API keys for the respective model providers:
   - **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Anthropic**: [Anthropic Console](https://console.anthropic.com/)
   - **Google Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **Ollama**: Local instance (default: `http://localhost:11434`)
4. Click **Test Key** to verify connection.
5. All keys are encrypted client-side using **Web Crypto API (AES-GCM 256-bit with PBKDF2 key derivation)** before being saved to browser `localStorage`.

### Option B: Local `.env.local` File (For Automated Local Dev)
If you want keys automatically loaded in development:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate the required values:
   ```env
   VITE_OPENAI_API_KEY=sk-...
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   VITE_GOOGLE_API_KEY=AIzaSy...
   VITE_OLLAMA_BASE_URL=http://localhost:11434
   ```

> [!CAUTION]
> Never commit `.env.local` or any files containing live secrets to GitHub. `.env.local` is included in `.gitignore`.

---

## 🦙 Local Ollama Integration

Contexta supports 100% offline and self-hosted models via Ollama.

### 1. Install & Start Ollama
```bash
# macOS
brew install ollama
ollama serve

# Or run a model directly
ollama run llama3:8b
# or
ollama run mistral
```

### 2. Configure CORS for Web Access
Because Contexta runs in the browser, Ollama must allow web origins:
```bash
# macOS/Linux terminal before launching ollama
export OLLAMA_ORIGINS="*"
ollama serve
```

### 3. Connect in Contexta
In Contexta Settings, ensure `Ollama Base URL` is set to `http://localhost:11434`.

---

## 📄 PDF Extraction & Web Worker

Contexta extracts text from uploaded PDF contracts, research papers, and technical specifications locally using `pdfjs-dist`.

- Worker script is located at: `public/pdf.worker.min.mjs`
- Processing is executed off the main UI thread to prevent UI freezing during large document parsing (e.g. 100+ page contracts).

---

## 🧪 Testing & Quality Assurance

Contexta uses **Vitest** and **React Testing Library** for fast, reliable unit and integration testing.

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI interface
npm run test:ui

# Generate test coverage report
npm run test:coverage
```

---

## 📦 Production Build & Preview

To create an optimized production bundle:

```bash
npm run build
```

To preview the production bundle locally:
```bash
npm run preview
```

---

## 🐳 Docker Deployment

A lightweight `Dockerfile` is included in the project root:

```bash
# Build Docker image
docker build -t contexta:latest .

# Run container
docker run -p 8080:80 contexta:latest
```
Open `http://localhost:8080` in your browser.
