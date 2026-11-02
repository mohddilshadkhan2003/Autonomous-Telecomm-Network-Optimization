from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import random
import uvicorn

app = FastAPI(title="AutoNetOps Backend API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = datetime.utcnow()


class TelemetryData(BaseModel):
    device_id: str
    timestamp: datetime
    metrics: dict
    protocol: str


class IncidentReport(BaseModel):
    incident_id: str
    device_id: str
    severity: str
    root_cause: str
    status: str


def generate_incidents():
    templates = [
        {
            "incidentId": "INC-2026-001",
            "deviceId": "BTS-47-NE",
            "severity": "Critical",
            "rootCause": "Packet drop spike detected on backhaul link",
            "status": "Investigating",
            "lastUpdated": "1 min ago",
        },
        {
            "incidentId": "INC-2026-002",
            "deviceId": "CORE-12",
            "severity": "Major",
            "rootCause": "CPU saturation caused by unstable routing burst",
            "status": "Mitigating",
            "lastUpdated": "5 min ago",
        },
        {
            "incidentId": "INC-2026-003",
            "deviceId": "ROUTE-09",
            "severity": "Minor",
            "rootCause": "SNMP polling timeout from collector lag",
            "status": "Resolved",
            "lastUpdated": "11 min ago",
        },
        {
            "incidentId": "INC-2026-004",
            "deviceId": "RAN-27-CLUSTER",
            "severity": "Major",
            "rootCause": "Interference pattern increased across sector boundary",
            "status": "Monitoring",
            "lastUpdated": "2 min ago",
        },
    ]
    return templates


def generate_network_metrics():
    labels = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"]
    packet_loss = [0.4, 0.6, 0.9, 1.3, 1.1, 1.8, 2.1, 1.6]
    latency = [19, 22, 24, 30, 29, 35, 41, 38]

    if random.random() > 0.5:
        packet_loss[-1] = round(packet_loss[-1] + random.uniform(0.1, 0.7), 1)
        latency[-1] = round(latency[-1] + random.uniform(2, 9), 1)

    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Packet Loss (%)",
                "data": packet_loss,
                "borderColor": "#22c55e",
                "backgroundColor": "rgba(34,197,94,0.12)",
                "tension": 0.35,
            },
            {
                "label": "Latency (ms)",
                "data": latency,
                "borderColor": "#38bdf8",
                "backgroundColor": "rgba(56,189,248,0.12)",
                "tension": 0.35,
            },
        ],
    }


def create_overview():
    incidents = generate_incidents()
    return {
        "systemStatus": "Stable",
        "summaryMetrics": {
            "health": "Nominal",
            "uptime": "99.98%",
            "activeAlerts": len(incidents),
            "predictionRisk": "High",
            "meanTimeToRepair": "12 min",
        },
        "networkSummary": {
            "coverage": "96.4%",
            "energyEfficiency": "82%",
            "faultProbability": "7.8%",
            "activeSites": 148,
        },
        "alerts": [
            {"id": incident["incidentId"], "device": incident["deviceId"], "severity": incident["severity"]}
            for incident in incidents[:3]
        ],
    }


@app.get("/")
async def root():
    return {
        "service": "AutoNetOps",
        "status": "online",
        "version": "2.0.0",
        "description": "Autonomous telecom network optimization platform",
    }


@app.post("/ingest/telemetry")
async def ingest_telemetry(data: TelemetryData):
    return {
        "status": "ingested",
        "device_id": data.device_id,
        "timestamp": data.timestamp.isoformat(),
        "protocol": data.protocol,
        "message": "Telemetry processed by the anomaly detection pipeline",
    }


@app.get("/incidents")
async def get_incidents():
    return {"incidents": generate_incidents()}


@app.get("/dashboard/overview")
async def dashboard_overview():
    return create_overview()


@app.get("/network/metrics")
async def network_metrics():
    return generate_network_metrics()


@app.post("/agents/trigger")
async def trigger_agents(incident_id: str):
    return {
        "status": "agents_triggered",
        "incident_id": incident_id,
        "message": "Monitoring, RCA, and remediation agents dispatched successfully.",
    }


@app.get("/health")
async def health_check():
    uptime_seconds = (datetime.utcnow() - START_TIME).total_seconds()
    hours, remainder = divmod(int(uptime_seconds), 3600)
    minutes, _ = divmod(remainder, 60)
    return {
        "status": "healthy",
        "version": "2.0.0",
        "uptime": f"{hours}h {minutes}m",
        "backend": "FastAPI",
        "last_checked_at": datetime.utcnow().isoformat() + "Z",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
