<div align="center">

# 🧠 CONTEXTA
### Context Optimization & Lost-in-the-Middle Benchmarking Platform for Large Language Models

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-26%20Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)](./vitest.config.ts)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <b>A unified dual-engine platform designed to systematically evaluate, visualize, and mitigate the "Lost in the Middle" attention degradation in LLMs across extended context windows (8K to 128K+ tokens).</b>
</p>

[Quick Start](#-quick-start) • [The Problem](#-the-problem-lost-in-the-middle) • [Core Features](#-core-features) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contributing](#-contributing)

---

</div>

## 📌 Executive Summary

Modern frontier LLMs boast massive context windows (8K to 1M+ tokens), yet empirical research reveals a critical flaw: **models reliably forget or fail to retrieve factual needles positioned in the middle of long prompts**.

**Contexta** solves this problem by pairing an **empirical benchmarking lab** with an **active context optimization engine**:

```
                       ┌───────────────────────────────────────────────┐
                       │        CONTEXTA UNIFIED ARCHITECTURE          │
                       └──────────────────────┬────────────────────────┘
                                              │
                ┌─────────────────────────────┴─────────────────────────────┐
                ▼                                                           ▼
 ┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
 │ 🔬 BENCHMARK & OPTIMIZATION LAB         │   │ 💬 INTELLIGENT CHAT STUDIO              │
 │  • Synthetic Needle-in-a-Haystack       │   │  • Multi-Provider LLM Gateway           │
 │  • 2D Lost-in-the-Middle Heatmap        │   │  • Dynamic Token Budget Monitor         │
 │  • Dynamic Block Reordering (DBR)       │   │  • Auto-Summarization (70% Threshold)   │
 │  • Semantic Prioritization Scorer (SPS) │   │  • Local PDF Extraction (Web Worker)    │
 │  • Printable Academic Reports (PDF/JSON)│   │  • Conversation Branching & Forking     │
 └─────────────────────────────────────────┘   └─────────────────────────────────────────┘
```

---

## 📉 The Problem: "Lost in the Middle"

As prompt length dilates, transformer self-attention exhibits pronounced **Primacy** and **Recency** biases:

```
Retrieval Accuracy (%)
100% ────┐                                                 ┌──── (Recency Bias)
         │ (Primacy Bias)                                   │
         │                                                 │
  0% ────┴─────────────────────── Middle Deadzone ─────────┴────
        0% (Start)                   50% (Middle)              100% (End)
```

1. **Primacy Bias**: Strong attention retention at the start of prompts (system prompts, prompt headers).
2. **Recency Bias**: Elevated attention retention at the end of prompts (immediately preceding generation).
3. **The Middle Deadzone**: Retrieval recall plummets significantly between 35%–65% depth percentiles.

Contexta provides the algorithms to empirically quantify this drop and translocate critical facts into high-attention buffer zones.

---

## ✨ Core Features

### 🔬 1. Benchmark & Optimization Lab
- **Synthetic Dilation Regimes**: Test context sizes across `8K`, `16K`, `32K`, `64K`, and `128K` tokens.
- **Needle-in-a-Haystack (NIAH)**: Dynamically injects factual needles at precise depth percentiles (`10%`, `25%`, `50%`, `75%`, `90%`).
- **Domain Haystacks**: Preloaded benchmarks for **Legal Contracts (MSA)**, **Academic Research Papers**, and **Source Code Repositories**.
- **Dynamic Block Reordering (DBR)**: Mathematical transposition algorithm that redistributes middle-deadzone chunks into primacy and recency boundaries.
- **Semantic Prioritization Scorer (SPS)**: Query-to-chunk relevance scoring to optimize payload density.
- **Interactive 2D Heatmaps & Block Visualizers**: Real-time visualization comparing raw context memory layout vs optimized memory layout.
- **Academic Export**: One-click generation of standardized academic evaluation reports in JSON and printable format.

### 💬 2. Intelligent Chat Studio
- **Multi-Model Provider Support**: Seamless switching between **OpenAI** (GPT-4o, o1), **Anthropic** (Claude 3.5 Sonnet), **Google Gemini** (1.5 Pro, Flash), and **Ollama** (Llama 3, Mistral, Local).
- **Dynamic Token Budget Progress Bar**: Color-coded real-time tracking of token utilization.
- **Threshold Auto-Summarization**: Automatically compresses older conversation turns when token usage exceeds 70% (configurable), retaining the latest turns for seamless continuity.
- **Document Ingestion**: Client-side PDF and text extraction via Web Workers with citation mapping.
- **Conversation Tree Forking**: Branch off at any message turn to explore alternate responses without losing conversation history.
- **Real-Time Cost Analytics**: Dynamic token and cost expenditure tracking per model.

### 🔒 3. Enterprise-Grade Client-Side Security
- **Web Crypto API (AES-GCM 256-bit)**: All API keys are encrypted client-side using PBKDF2 key derivation and random IVs.
- **Zero Telemetry / Zero Server Storage**: Credentials and documents remain strictly inside your browser environment (IndexedDB and encrypted LocalStorage).
- **Format Validation & Live Verification**: Instant validation of API credentials before persistence.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (`v18.0.0` or higher)
- `npm`, `pnpm`, or `bun`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SRD1510/Contexta.git
cd Contexta

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` to explore Contexta!

---

## ⚙️ Configuration & Environment

Contexta keys can be configured directly inside the UI (Settings modal), or loaded locally via `.env.local`:

```bash
cp .env.example .env.local
```

```env
# Optional: Preload development keys
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_GOOGLE_API_KEY=your_gemini_key
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

For complete setup guides (including local Ollama CORS configuration), see [docs/SETUP_AND_ENV.md](./docs/SETUP_AND_ENV.md).

---

## 🧪 Testing & Validation

Contexta maintains a comprehensive test suite powered by **Vitest** and **React Testing Library**:

```bash
# Run all unit and integration tests
npm run test:run

# Run interactive Vitest UI
npm run test:ui

# Verify production build bundle
npm run build
```

```
✓ src/services/documentProcessor.test.ts (6 tests)
✓ src/stores/__tests__/conversationStore.test.ts (9 tests)
✓ src/services/benchmark/__tests__/benchmarkEngine.test.ts (7 tests)
✓ src/features/phase1.test.tsx (4 tests)

Test Files  4 passed (4)
     Tests  26 passed (26)
```

---

## 🏛️ Architecture

For complete system design, component hierarchies, state models, and optimization algorithm specifications, please refer to:
- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - Full technical specification
- 🔬 [docs/BENCHMARK_AND_OPTIMIZATION.md](./docs/BENCHMARK_AND_OPTIMIZATION.md) - Algorithm deep dive & evaluation mechanics
- 🛠️ [docs/SETUP_AND_ENV.md](./docs/SETUP_AND_ENV.md) - Detailed deployment & environment documentation

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) guide for details on our code of conduct, development workflow, and pull request process.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

<div align="center">
  <sub>Developed by <b>SRD1510</b> & Contributors. Department of Information Technology.</sub>
</div>
