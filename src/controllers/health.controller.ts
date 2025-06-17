import { Request, Response } from 'express';

export class HealthController {
  constructor() {
    console.log('HealthController initialized');
  }

  async getHealth(req: Request, res: Response): Promise<void> {
    console.log('Handling getHealth request');
    res.status(200).json({ status: 'OK' });
    return;
  }
}