import type { Request, Response } from 'express';
import app from '../server.ts';

/**
 * Vercel Serverless Function entry point
 * Bridges incoming Vercel API requests to the full-featured Express backend
 */
export default function handler(req: Request, res: Response) {
  if (req.url && !req.url.startsWith('/api')) {
    const normalized = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    req.url = normalized;
    (req as any).originalUrl = normalized;
  }
  return app(req, res);
}
