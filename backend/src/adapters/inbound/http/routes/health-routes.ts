import type { Express, Request, Response } from 'express';

export const registerHealthRoutes = (app: Express): void => {
  app.get('/health', (_request: Request, response: Response) => {
    response.status(200).json({ status: 'ok' });
  });
};

