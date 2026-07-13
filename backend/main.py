import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
from simulator import SafetySimulator

app = FastAPI(title="SafetyAI v2.0 - Cinematic API Server")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active Simulator Instance
simulator = SafetySimulator()

# Active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Immediately send current state upon connection
        await self.send_state(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                # Handle broken connections gracefully
                pass

    async def send_state(self, websocket: WebSocket):
        state = simulator.get_serializable_state()
        await websocket.send_text(json.dumps({"type": "STATE_UPDATE", "data": state}))

manager = ConnectionManager()

# Background simulation runner
async def simulation_loop():
    while True:
        if simulator.is_running and not simulator.is_paused and not simulator.awaiting_approval:
            simulator.update_ticks()
            state = simulator.get_serializable_state()
            await manager.broadcast({"type": "STATE_UPDATE", "data": state})
        
        # Tick interval: 1.5 seconds per tick (simulating 30 seconds of operations)
        await asyncio.sleep(1.5)

@app.on_event("startup")
async def startup_event():
    # Start the simulation loop in the background
    asyncio.create_task(simulation_loop())

class TriggerRequest(BaseModel):
    scenario: str # "NORMAL" or "CO_LEAK"
    preset: str = "OPERATIONAL_DRIFT" # "OPERATIONAL_DRIFT" or "CRITICAL_ESCALATION"

@app.post("/api/scenario/trigger")
async def trigger_scenario(req: TriggerRequest):
    simulator.trigger_scenario(req.scenario, req.preset)
    state = simulator.get_serializable_state()
    await manager.broadcast({"type": "STATE_UPDATE", "data": state})
    return {"status": "ok", "message": f"Scenario {req.scenario} with preset {req.preset} started"}

class ControlRequest(BaseModel):
    action: str # "start", "pause", "resume", "reset"

@app.post("/api/scenario/control")
async def control_scenario(req: ControlRequest):
    if req.action == "start":
        simulator.is_running = True
        simulator.is_paused = False
    elif req.action == "pause":
        simulator.is_paused = True
    elif req.action == "resume":
        simulator.is_paused = False
        simulator.is_running = True
    elif req.action == "reset":
        simulator.reset()
    
    state = simulator.get_serializable_state()
    await manager.broadcast({"type": "STATE_UPDATE", "data": state})
    return {"status": "ok", "action": req.action}

@app.post("/api/scenario/approve")
async def approve_plan():
    simulator.approve_plan()
    state = simulator.get_serializable_state()
    await manager.broadcast({"type": "STATE_UPDATE", "data": state})
    return {"status": "ok", "action": "approved"}

@app.post("/api/scenario/escalate")
async def escalate_plan():
    simulator.escalate_plan()
    state = simulator.get_serializable_state()
    await manager.broadcast({"type": "STATE_UPDATE", "data": state})
    return {"status": "ok", "action": "escalated"}

@app.get("/api/session/{incident_id}/narrative")
async def get_session_narrative(incident_id: str):
    return simulator.get_narrative_structure()

@app.get("/api/replay")
async def get_replay_logs(preset: str = "OPERATIONAL_DRIFT"):
    cfg = simulator.scenario_config
    direction = cfg["direction"]
    base = cfg["normal_base"]
    threshold = cfg["safety_threshold"]
    
    if preset == "OPERATIONAL_DRIFT":
        peak = threshold + 3.0 if direction == "up" else threshold - 1.5
    else:
        peak = threshold + 8.0 if direction == "up" else threshold - 3.5
        
    replay_data = []
    gap = peak - base
    
    for tick in range(60):
        total_seconds = tick * 30
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        time_str = f"09:{minutes:02d}:{seconds:02d}"
        
        if tick <= 10:
            co = round(base + math.sin(tick) * 0.1, 2)
            level = "SAFE"
            score = 18
        elif tick <= 20:
            progress = (tick - 10) / 10.0
            co = round(base + (gap * 0.3 * progress), 2)
            level = "WATCH"
            score = 38
        elif tick <= 30:
            progress = (tick - 20) / 10.0
            co = round(base + gap * 0.3 + (gap * 0.5 * progress), 2)
            level = "PREPARE"
            score = 68
        elif tick <= 35:
            progress = (tick - 30) / 5.0
            co = round(base + gap * 0.8 + (gap * 0.2 * progress), 2)
            level = "ACT"
            score = 88
        elif tick <= 45:
            progress = (tick - 35) / 10.0
            co = round(peak - (peak - base) * progress, 2)
            level = "RECOVERY"
            score = 55
        elif tick <= 55:
            co = round(base + math.sin(tick) * 0.05, 2)
            level = "RECOVERY"
            score = 23
        else:
            co = round(base + math.sin(tick) * 0.02, 2)
            level = "CLOSED"
            score = 15
            
        replay_data.append({
            "tick": tick,
            "time": time_str,
            "co_level": co,
            "risk_level": level,
            "risk_score": score,
            "permit_suspended": tick > 35
        })
        
    return {"status": "ok", "replay": replay_data}

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open and listen for heartbeat
            data = await websocket.receive_text()
            # If client sends a trigger, we can handle it
            msg = json.loads(data)
            if msg.get("type") == "PING":
                await websocket.send_text(json.dumps({"type": "PONG"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# Dynamic import to support run-time math
import math

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
