# Contributing to Contexta

Thank you for your interest in contributing to **Contexta**! We welcome contributions from researchers, software engineers, and AI practitioners.

---

## 🧭 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please treat all contributors with respect and professionalism.

---

## 🛠️ Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/SRD1510/Contexta.git
cd Contexta
```

### 2. Create a Feature Branch
Use descriptive branch naming conventions:
- `feature/your-feature-name`
- `fix/issue-description`
- `docs/documentation-update`
- `perf/optimization-target`

```bash
git checkout -b feature/dynamic-reorder-improvements
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Code Standards & Guidelines
- **TypeScript**: Strict type-checking enabled (`noImplicitAny`, type-safe stores).
- **Architecture**: Keep components modular, colocate helper functions, and avoid duplicate state.
- **Styling**: Tailwind CSS with Shadcn UI components. Maintain dark/light theme compatibility.
- **Security**: Never store plain-text secrets in LocalStorage or commit credentials. Use Web Crypto API encryption routines in `src/lib/security.ts`.

### 5. Run Tests & Validation
Before submitting your changes, verify that all tests pass:

```bash
# Run unit & integration tests
npm run test:run

# Run TypeScript build check
npm run build

# Run ESLint
npm run lint
```

---

## 📝 Pull Request Guidelines

1. **Title**: Follow conventional commits (e.g. `feat: add Claude 3.7 Sonnet model support`, `fix: handle edge case in needle depth injection`).
2. **Description**: Clearly state:
   - What problem does this PR solve?
   - How was it implemented?
   - Any breaking changes or new dependencies?
3. **Screenshots / Benchmarks**: For UI changes or optimization algorithms, include visual evidence or benchmark comparisons.
4. **Link Issues**: Reference related GitHub issues (e.g., `Closes #12`).

---

## 📜 License
By contributing to Contexta, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
