import express, { type Express } from 'express';

import { registerHealthRoutes } from './routes/health-routes.js';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());
  registerHealthRoutes(app);

  return app;
};

