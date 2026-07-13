# Future Scope - Production Roadmap

This document outlines the transition roadmap from the **SafetyAI v2.0 Hackathon Demo** to an enterprise production-grade deployment. It details all subsystems that were simulated, mocked, or simplified to maximize visual impact during the initial phase.

---

## 1. Core Architecture & Event Routing

| Subsystem | Hackathon Demo Implementation | Enterprise Production Architecture |
| :--- | :--- | :--- |
| **Event Broker** | In-memory synchronous function dispatcher. | **Apache Kafka** or **RabbitMQ** for highly available, partitioned event streams. |
| **Event Bus Wrapper** | In-process pub/sub topic routing. | Dedicated Redis-based event bus wrapper with topic registries. |
| **State Management** | Python dictionaries and in-memory variables. | **Redis Cluster** with replication and persistent snapshots using Redis Hash + Sorted Sets (for rolling 30-min sensor windows). |
| **Microservices** | Single Python FastAPI process executing agents sequentially. | Independent dockerized microservices using **FastAPI / Go** communicating over event topics. |
| **WebSockets** | Single-node FastAPI WebSockets. | Distributed WebSocket gateway with a **Redis Adapter** for scale-out. |

---

## 2. Intelligence & Reasoning Layers

### Dynamic Knowledge Graph
* **Demo**: In-memory NetworkX Python object representing relationships between 8 zones, active permits, and sensors.
* **Production**: **Neo4j** or **Amazon Neptune** graph database to store millions of entity connections (workers, equipment IDs, safety procedures, sensors) with cypher-query based anomaly detection. Shows live interactive KG overlays in the UI.

### Incident RAG & Memory
* **Demo**: Local JSON index loaded into memory for quick keyword searches of Incident #23.
* **Production**: **ChromaDB / pgvector** with open-source embeddings (e.g., HuggingFace sentence-transformers) indexing thousands of historical logs, OISD standards, Factory Acts, and training manuals. Re-ranked using BM25 and cross-checked using LLMs.

### Predictive Modeling
* **Demo**: Simple trend extrapolation (slope-based linear forecasting).
* **Production**: **Physics-Informed Neural Networks (PINNs)** or **LSTM/GRU autoencoders** trained on long-term historical plant sensor data to predict multi-gas dispersion patterns, factoring in wind direction and atmospheric pressure.

---

## 3. Compliance & Human-in-the-Loop

### Automated Regulatory Audits
* **Demo**: Hardcoded rules and deterministic checks (e.g., checking if Hot Work is active in high gas zones) with regulatory references loaded statically.
* **Production**: Full compliance engine evaluating operations against the **Indian Factory Act 1948**, **DGMS regulations**, and **OISD standards** using dynamic LLM validation.

### Feedback Loop & Learning
* **Demo**: Simulated tracking of sensor recovery rates; override logs stored statically.
* **Production**: SQLite/PostgreSQL relational database storing every human override, feeding a continuous training pipeline to fine-tune the planner's risk-reduction formulas without restarting the application.

### DGFASLI Regulatory Report PDF Generation
* **Demo**: Real-time interactive **Incident Summary Card** on screen (high-value visual card showing summary, timeline, and audit logs).
* **Production**: Background PDF compiler (e.g. ReportLab or Weasyprint) compiling multi-page regulatory-compliant safety audit documents containing cryptographic sensor log signatures.

---

## 4. Hardware & Vision Integrations

### Computer Vision (CCTV)
* **Demo**: Simulated worker presence and location tracking within 8 zones.
* **Production**: **YOLOv8/v10** object detection streams analyzing CCTV feeds in real time to verify PPE compliance (helmets, harnesses) and track actual worker geospatial coordinates over the plant layout.

### IoT / SCADA Integration
* **Demo**: Scripted physics simulation ticks.
* **Production**: Direct integration with industrial PLC/SCADA systems using **OPC-UA**, **Modbus**, or **MQTT** industrial gateways.
