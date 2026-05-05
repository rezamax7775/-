import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'customers.json');
const USERS_FILE = path.join(__dirname, 'users.json');

async function ensureDb() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify([]));
  }
  
  try {
    await fs.access(USERS_FILE);
  } catch {
    // ایجاد کاربر مدیر پیش‌فرض: admin / admin123
    await fs.writeFile(USERS_FILE, JSON.stringify([{
      username: 'admin',
      password: '123',
      name: 'مدیر سیستم'
    }]));
  }
}

async function startServer() {
  await ensureDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Login
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf-8'));
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
      res.json({ success: true, user: { username: user.username, name: user.name } });
    } else {
      res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' });
    }
  });

  // API Routes
  app.get('/api/customers', async (req, res) => {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.post('/api/customers', async (req, res) => {
    const customers = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
    const newCustomer = req.body;
    customers.push(newCustomer);
    await fs.writeFile(DB_FILE, JSON.stringify(customers, null, 2));
    res.status(201).json(newCustomer);
  });

  app.put('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    const customers = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
    const index = customers.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      customers[index] = req.body;
      await fs.writeFile(DB_FILE, JSON.stringify(customers, null, 2));
      res.json(customers[index]);
    } else {
      res.status(404).send('Not found');
    }
  });

  app.delete('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    let customers = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
    customers = customers.filter((c: any) => c.id !== id);
    await fs.writeFile(DB_FILE, JSON.stringify(customers, null, 2));
    res.status(204).send();
  });

  // Import multiple
  app.post('/api/customers/import', async (req, res) => {
    const current = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
    const incoming = req.body; // array
    const updated = [...current, ...incoming];
    await fs.writeFile(DB_FILE, JSON.stringify(updated, null, 2));
    res.json({ count: incoming.length });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
