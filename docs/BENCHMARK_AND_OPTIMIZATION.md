# Benchmark & Optimization Engine Specification

## 🔬 The "Lost in the Middle" Phenomenon

Modern Large Language Models advertise vast context windows ranging from 8K to 128K, 1M, or 2M tokens. However, empirical research (notably Liu et al., 2023, *"Lost in the Middle: How Language Models Use Long Contexts"*) demonstrates that LLM retrieval accuracy degrades severely when relevant information is positioned in the **middle** of long input prompts.

```
       Attention & Retrieval Performance Across Context Depth
100% ─────────────────────────┐                     ┌────────────────────────
      (Primacy Bias)          │                     │   (Recency Bias)
                              │                     │
 50%                          \                     /
                               \                   /
                                └─── "Deadzone" ──┘
  0% ─────────────────────────────── Middle Depth ────────────────────────────
     0% (Start of Context)                50% (Deadzone)            100% (End)
```

### Key Drivers:
1. **Primacy Bias**: LLMs attend heavily to initial system instructions, prompt headers, and early examples.
2. **Recency Bias**: LLMs attend strongly to tokens closest to the generation target (`<|im_start|>user`, generation prompt).
3. **Middle Dispersion**: Mid-prompt tokens receive lower relative attention weight in standard transformer attention matrices unless specifically modulated.

---

## 🧪 Contexta Benchmark Lab Architecture

Contexta provides a synthetic evaluation lab that empirically probes, visualizes, and optimizes LLM context handling across two core dimensions:

1. **Context Length Dilation**:
   - `8,192` tokens (8K)
   - `16,384` tokens (16K)
   - `32,768` tokens (32K)
   - `64,536` tokens (64K)
   - `131,072` tokens (128K)

2. **Discrete Depth Injection Percentiles**:
   - `10%` (Near Start / High Primacy)
   - `25%` (Early-Mid)
   - `50%` (Central Deadzone)
   - `75%` (Mid-Late)
   - `90%` (Near End / High Recency)

---

## 🪡 Needle-in-a-Haystack (NIAH) Framework

In Contexta, a **"Haystack"** is constructed using domain corpora:
- **Legal Contracts (MSA)**: Clauses, indemnity covenants, jurisdiction declarations.
- **Academic Research Papers**: Transformer mechanics, benchmark tables, ablation descriptions.
- **Software Codebases**: Source files, function signatures, unit test definitions.

A unique factual **"Needle"** (e.g., *"The secret emergency override code for Project Chimera is 8829-XJ"*) is injected at precisely calculated token offsets corresponding to target depth percentages.

The evaluator then queries the model with an exact-retrieval prompt:
> *"What is the secret emergency override code for Project Chimera?"*

### Evaluation Metrics:
- **Retrieval Recall**: Exact match / semantic validity of the target needle.
- **Latency (ms)**: Time-to-first-token and complete generation latency across token sizes.
- **Degradation Delta ($\Delta$)**: Difference in recall between `10%`/`90%` positions vs `50%` deadzone.

---

## ⚙️ Optimization Algorithms

Contexta features two dynamic mitigation algorithms that reorganize context blocks before dispatching the payload to the LLM:

### 1. Dynamic Block Reordering (DBR)
Dynamic Block Reordering partitions long documents and context into logical chunks $C_1, C_2, \dots, C_n$. Chunks identified within the middle deadzone ($35\% \le \text{depth} \le 65\%$) are systematically translocated towards the peripheral high-attention regions:

$$\text{Reordered} = [C_{\text{critical\_middle}}, C_1, C_2, \dots, C_{n-1}, C_{\text{secondary\_middle}}, C_n]$$

- Elevates high-risk middle chunks into primacy or recency buffers.
- Preserves local semantic coherence using sliding reference markers.

### 2. Semantic Prioritization Scoring (SPS)
Semantic Prioritization computes relevance scores between the incoming user query $Q$ and each candidate block $B_i$:

$$\text{Score}(Q, B_i) = \alpha \cdot \text{TF-IDF}(Q, B_i) + \beta \cdot \text{EntityMatch}(Q, B_i) + \gamma \cdot \text{PositionalDecay}(i)$$

Blocks exceeding a relevance threshold $\tau$ are prepended to the high-attention entrypoint of the context buffer, neutralizing the deadzone drop-off.

---

## 📊 Analytics & Academic Reporting

- **2D Retrieval Heatmap**: Interactive matrix visualizing retrieval accuracy across Context Length (columns) and Depth Percentile (rows).
- **Block Order Visualizer**: Real-time visual comparison showing Raw Context layout vs Optimized Context layout.
- **Academic Export**: Generates standardized JSON, CSV, and printable PDF evaluation reports suitable for research papers, thesis presentations, and benchmarks.
