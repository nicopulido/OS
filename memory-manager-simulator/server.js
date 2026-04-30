import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import simulationRoutes from './backend/routes/simulationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', simulationRoutes);
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (_request, response) => {
  response.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
  console.log(`MemSim Ultra running at http://localhost:${port}`);
});
