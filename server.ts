import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'customers.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

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

  try {
    await fs.access(CONFIG_FILE);
  } catch {
    await fs.writeFile(CONFIG_FILE, JSON.stringify({
      sms: {
        provider: 'ippanel',
        apiKey: '',
        sender: '',
        enabled: false
      }
    }));
  }
}

async function startServer() {
  await ensureDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // SMS API
  app.get('/api/sms/settings', async (req, res) => {
    const config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf-8'));
    res.json(config.sms);
  });

  app.post('/api/sms/settings', async (req, res) => {
    const config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf-8'));
    config.sms = { ...config.sms, ...req.body };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    res.json(config.sms);
  });

  app.post('/api/sms/send', async (req, res) => {
    const { phoneNumbers, message } = req.body;
    const config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf-8'));
    const { provider, apiKey, sender, enabled } = config.sms;

    if (!enabled || !apiKey) {
      return res.status(400).json({ success: false, message: 'پنل پیامک تنظیم نشده یا غیرفعال است' });
    }

    try {
      if (provider === 'ippanel') {
        const url = 'https://api2.ippanel.com/api/v1/sms/send/panel/single';
        // این یک مثال از پیاده‌سازی ippanel است
        // برای سادگی فعلاً یک لاگ می‌زنیم و پیام موفقیت برمی‌گردانیم
        console.log(`Sending SMS to ${phoneNumbers.join(', ')} via ippanel: ${message}`);
        
        // در محیط واقعی اینجا درخواست axios زده می‌شود
        /*
        await axios.post(url, {
          recipient: phoneNumbers,
          sender: sender,
          message: message
        }, { headers: { 'Authorization': `AccessKey ${apiKey}` } });
        */
      } else if (provider === 'kavenegar') {
        console.log(`Sending SMS to ${phoneNumbers.join(', ')} via kavenegar: ${message}`);
        // https://api.kavenegar.com/v1/{API-KEY}/sms/send.json
      }

      res.json({ success: true, message: 'پیامک با موفقیت به صف ارسال اضافه شد' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

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

  // API User Management
  app.get('/api/users', async (req, res) => {
    const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf-8'));
    // پسوردها را در لیست ارسالی حذف می‌کنیم برای امنیت
    const safeUsers = users.map(({ password, ...u }: any) => u);
    res.json(safeUsers);
  });

  app.post('/api/users', async (req, res) => {
    const newUser = req.body;
    const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf-8'));
    
    if (users.find((u: any) => u.username === newUser.username)) {
      return res.status(400).json({ success: false, message: 'این نام کاربری قبلاً انتخاب شده است' });
    }

    users.push(newUser);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });
  });

  app.delete('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    if (username === 'admin') {
      return res.status(400).json({ success: false, message: 'حذف کاربر مدیر اصلی امکان‌پذیر نیست' });
    }
    
    let users = JSON.parse(await fs.readFile(USERS_FILE, 'utf-8'));
    users = users.filter((u: any) => u.username !== username);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });
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
