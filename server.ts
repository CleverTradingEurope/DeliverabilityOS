import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { validateEmail } from './src/lib/validator.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Real-time Validation API
  app.post('/api/validate', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const result = await validateEmail(email);
      res.json(result);
    } catch (error: any) {
      console.error('Validation error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
