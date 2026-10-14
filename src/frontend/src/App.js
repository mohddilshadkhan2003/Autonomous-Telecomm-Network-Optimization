import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Box, Button, Container, CssBaseline, Grid, Paper, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import StatusCard from './components/StatusCard';
import IncidentTable from './components/IncidentTable';
import ChatAssistant from './components/ChatAssistant';
import { summaryMetrics, incidentSamples, workflowMessages } from './mockData';
import { fetchHealth, fetchIncidents, triggerAgents } from './api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function App() {
  const [health, setHealth] = useState({ status: 'unknown' });
  const [incidents, setIncidents] = useState(incidentSamples);
  const [connected, setConnected] = useState(false);
  const [chatHistory, setChatHistory] = useState(workflowMessages);
  const [chartData, setChartData] = useState({
    labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'],
    datasets: [
      {
        label: 'Packet Loss (%)',
        data: [0.3, 0.5, 0.9, 1.2, 0.8, 1.6, 2.4],
        borderColor: '#22c55e',
        tension: 0.4,
      },
      {
        label: 'Latency (ms)',
        data: [18, 21, 24, 30, 28, 34, 40],
        borderColor: '#38bdf8',
        tension: 0.4,
      },
    ],
  });

  useEffect(() => {
    async function loadBackend() {
      try {
        const healthData = await fetchHealth();
        const incidentsData = await fetchIncidents();
        setHealth(healthData);
        setIncidents(incidentsData.length ? incidentsData : incidentSamples);
        setConnected(true);
      } catch (error) {
        setConnected(false);
      }
    }

    loadBackend();
    const interval = setInterval(() => {
      setChartData((prev) => {
        const nextLabels = prev.labels.slice(1).concat(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        const nextPacket = [...prev.datasets[0].data.slice(1), Math.round((Math.random() * 1.4 + 0.6) * 10) / 10];
        const nextLatency = [...prev.datasets[1].data.slice(1), Math.round((Math.random() * 10 + 20) * 10) / 10];
        return {
          ...prev,
          labels: nextLabels,
          datasets: [
            { ...prev.datasets[0], data: nextPacket },
            { ...prev.datasets[1], data: nextLatency },
          ],
        };
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const statusCards = useMemo(() => [
    { title: 'System Health', value: connected ? 'Online' : 'Offline', detail: connected ? 'Connected to backend' : 'Fallback mode', statusColor: connected ? '#22c55e' : '#f97316' },
    { title: 'Network Uptime', value: summaryMetrics.uptime, detail: 'Service-level stability', statusColor: '#38bdf8' },
    { title: 'Active Alerts', value: incidents.length, detail: 'CIIMT incident queue', statusColor: '#fb7185' },
    { title: 'Prediction Risk', value: summaryMetrics.predictionRisk, detail: 'Pre-failure detection', statusColor: '#f59e0b' },
  ], [connected, incidents.length]);

  const handleSendMessage = (message) => {
    setChatHistory((history) => [
      ...history,
      { role: 'user', text: message },
      { role: 'assistant', text: `CIIMT detected key risk patterns and recommends reviewing ${incidents[0]?.deviceId || 'target node'}.` },
    ]);
  };

  const handleTriggerRemediation = async () => {
    const result = await triggerAgents(incidents[0]?.incidentId || 'unknown');
    setChatHistory((history) => [
      ...history,
      { role: 'system', text: 'CIIMT remediation engine triggered.' },
      { role: 'assistant', text: `Remediation request status: ${result.status}.` },
    ]);
  };

  return (
    <Box className="App">
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" gutterBottom>
            CIIMT Network Intelligence
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time fault prediction, autonomous root cause analysis, and self-healing orchestration.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {statusCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <StatusCard {...card} />
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ mt: 3, p: 3, background: '#0f172a', border: '1px solid #334155' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Network telemetry trends
              </Typography>
              <Typography color="text.secondary">
                Live forecast demonstrates packet loss and latency behavior across the network core.
              </Typography>
            </Box>
            <Button variant="contained" onClick={handleTriggerRemediation} sx={{ bgcolor: '#2563eb' }}>
              Trigger Auto-Remediation
            </Button>
          </Box>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { labels: { color: '#e2e8f0' } } },
              scales: {
                x: { ticks: { color: '#cbd5e1' }, grid: { color: '#1e293b' } },
                y: { ticks: { color: '#cbd5e1' }, grid: { color: '#1e293b' } },
              },
            }}
          />
        </Paper>

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} lg={8}>
            <IncidentTable incidents={incidents} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <ChatAssistant history={chatHistory} onSend={handleSendMessage} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
