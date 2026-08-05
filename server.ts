import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { validateEmail } from './src/lib/validator.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Security Headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: false, // Vite Dev server requires looser CSP
  }));

  // CORS Configuration
  const appUrl = process.env.APP_URL || '*';
  app.use(cors({
    origin: appUrl !== '*' ? [appUrl] : '*',
  }));

  // Body parser with size limit
  app.use(express.json({ limit: '10kb' }));

  // Rate limiting for validation API
  const validationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 validation requests per `window` (here, per 15 minutes)
    message: { error: 'Too many requests, please try again later.' }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Real-time Validation API
  app.post('/api/validate', validationLimiter, async (req, res) => {
    const { email } = req.body;
    
    // Input validation
    if (!email || typeof email !== 'string' || email.length > 254 || email.length < 3) {
      return res.status(400).json({ error: 'Invalid or missing email address.' });
    }

    try {
      const result = await validateEmail(email);
      res.json(result);
    } catch (error: any) {
      console.error('Validation error:', error);
      res.status(500).json({ error: 'Internal server error. Please try again.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Use * for Express v4, *all for Express v5
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
