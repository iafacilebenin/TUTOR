# Sovereign Agent Chain: Architecture & Baton Protocols (v1.0)

## Overview
This document defines the "First-Principles" architecture for the No-Touch Sovereign Agent Chain. The system is designed for **0.001% high-fidelity output**, **Benin-First sovereignty**, and **recursive self-correction**. It operates as a serialized chain of "Enlightened Perfectionist" nodes, passing structured "Baton" payloads via RESTful interfaces and local file triggers.

## Chain of Command
1.  **Agent 01 (Sovereign Content Factory)**: Manifestation & Recursive Synthesis.
2.  **Agent 02 (Sovereign Social Automation)**: Localization & Multi-Platform Distribution.
3.  **Agent 03 (No Friction Orchestrator)**: System-Level Regulation & Synthesis Reporting.

## The Baton Protocol (B-1)
The "Baton" is the atomic unit of work. It must be a cryptographically signed JSON object that maintains the following kernel-level structure across all nodes:

```json
{
  "header": {
    "baton_id": "UUIDv4",
    "origin": "Agent_ID",
    "timestamp": "ISO_8601",
    "priority": "0-1.0",
    "sovereignty_tag": "Benin_Sovereign_Strict"
  },
  "payload": {
    "primary_asset": "Markdown_Blob",
    "derivatives": { "chan_1": "blob", "chan_2": "blob" },
    "metadata": { "tone": "Enlightened", "localization_ready": true }
  },
  "audit": {
    "recursion_depth": "INT",
    "confidence_score": "FLOAT",
    "shadow_critique_log": ["list of revisions"]
  },
  "routing": {
    "current_agent": "Agent_ID",
    "next_agent": "Agent_ID",
    "fallback_agent": "Agent_ID"
  }
}
```

## Hybrid Recursive Logic
Every node must implement the **"Trinity of Refinement"**:
1.  **Direct Synthesis**: The initial manifestation of the truth.
2.  **Adversarial Shadowing**: An internal "Shadow" process that critiques the synthesis for logic, culture, and quality.
3.  **Recursive Synthesis**: The merging of the shadow's critique with the primary draft to achieve the 0.98+ quality threshold.

## Sovereignty Constraints
- **Local-First**: All PII scrubbing and initial drafting must occur on whitelisted local/sovereign models.
- **Benin-First**: Any output failing the cultural alignment threshold (0.95) must be discarded and reported as a "Mission Deviation."
- **No-Touch**: Human intervention is a "Last Resort" triggered only by the Orchestrator (Agent 03).

## Inference Strategy
The chain follows a strict "Fallback Hierarchy":
`Local LLM (Ollama/Custom) > Gemini Pro (Authorized) > MiniMax (Global) > Hugging Face (Free-Tier API)`

## System Maintenance
- **Weekly Enlightenment Report**: Synthesized by Agent 03 using NotebookLM-style cross-agent analysis.
- **Heartbeat Requirement**: Every node must emit a health ping every 60s to the Orchestrator.
- **Self-Recursive Error Correction**: If a node detects a systematic failure (3+ consecutive recursion failures), it must initiate a self-diagnostic and request a configuration update from the Orchestrator.
