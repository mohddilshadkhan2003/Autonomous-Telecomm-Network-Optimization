import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 3500,
});

export async function fetchHealth() {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend unreachable');
  }
}

export async function fetchOverview() {
  try {
    const response = await api.get('/dashboard/overview');
    return response.data;
  } catch (error) {
    return {
      systemStatus: 'Fallback',
      summaryMetrics: {
        health: 'Nominal',
        uptime: '99.98%',
        activeAlerts: 0,
        predictionRisk: 'Moderate',
        meanTimeToRepair: '12 min',
      },
    };
  }
}

export async function fetchNetworkMetrics() {
  try {
    const response = await api.get('/network/metrics');
    return response.data;
  } catch (error) {
    return {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'],
      datasets: [
        {
          label: 'Packet Loss (%)',
          data: [0.3, 0.5, 0.9, 1.2, 0.8, 1.6, 2.4],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.12)',
          tension: 0.35,
        },
        {
          label: 'Latency (ms)',
          data: [18, 21, 24, 30, 28, 34, 40],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56,189,248,0.12)',
          tension: 0.35,
        },
      ],
    };
  }
}

export async function fetchIncidents() {
  try {
    const response = await api.get('/incidents');
    return response.data.incidents;
  } catch (error) {
    return [];
  }
}

export async function triggerAgents(incidentId) {
  try {
    const response = await api.post('/agents/trigger', null, {
      params: { incident_id: incidentId },
    });
    return response.data;
  } catch (error) {
    return { status: 'failed', reason: 'Unable to reach backend' };
  }
}
