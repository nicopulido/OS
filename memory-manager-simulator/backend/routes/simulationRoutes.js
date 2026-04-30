import { Router } from 'express';
import simulator from '../core/simulator.js';

const router = Router();

router.get('/state', (_request, response) => {
  response.json(simulator.getState());
});

router.post('/reset', (request, response) => {
  simulator.reset(request.body ?? {});
  response.json(simulator.getState());
});

router.post('/load-defaults', (_request, response) => {
  response.json(simulator.loadDefaultProcesses());
});

router.post('/processes', (request, response) => {
  try {
    const createdProcess = simulator.createProcess(request.body ?? {});
    response.status(201).json({ process: createdProcess, state: simulator.getState() });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

router.post('/step', (_request, response) => {
  response.json(simulator.step());
});

router.post('/compact', (_request, response) => {
  simulator.compactMemory();
  response.json(simulator.getState());
});

router.patch('/config', (request, response) => {
  try {
    simulator.setConfig(request.body ?? {});
    response.json(simulator.getState());
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

router.post('/refresh-snapshots', (_request, response) => {
  simulator.captureCurrentMemorySnapshot();
  response.json(simulator.getState());
});

export default router;
