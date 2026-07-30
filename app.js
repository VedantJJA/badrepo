import express from 'express';
import { execFile } from 'child_process';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix: Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INT, username TEXT, password TEXT, secret_note TEXT)");
  db.run("INSERT INTO users VALUES (1, 'admin', 'admin123', 'Super Secret Admin Note')");
  db.run("INSERT INTO users VALUES (2, 'alice', 'password123', 'Alice Personal Note')");
});

// In a real app, this should be an environment variable
const JWT_SECRET = "super_secret_hardcoded_key_12345";

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Simple authentication logic
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { algorithm: 'HS256' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/users/search', (req, res) => {
  const username = req.query.username;
  // FIX: Use parameterized queries to prevent SQL Injection
  const query = `SELECT id, username, secret_note FROM users WHERE username = ?`;

  db.all(query, [username], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

app.get('/api/system/ping', (req, res) => {
  const host = req.query.host;
  // FIX: Use execFile instead of exec to prevent Command Injection
  // This treats the input as a single argument rather than part of a shell command string
  execFile('ping', ['-c', '1', host], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(stderr || error.message);
    }
    res.send(stdout);
  });
});

app.get('/api/files/download', (req, res) => {
  const fileName = req.query.file;
  if (!fileName) return res.status(400).send('No file specified');

  // FIX: Prevent Path Traversal by resolving the path and checking it stays within 'public'
  const publicDir = path.resolve(__dirname, 'public');
  const filePath = path.resolve(publicDir, fileName);

  if (!filePath.startsWith(publicDir)) {
    return res.status(403).send('Access denied: File is outside the allowed directory');
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('File not found or access denied');
    }
    res.send(data);
  });
});

// Helper to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.get('/welcome', (req, res) => {
  const name = req.query.name || 'Guest';
  // FIX: Escape the input to prevent Cross-Site Scripting (XSS)
  const safeName = escapeHTML(name);
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Welcome!!!</title></head>
      <body>
        <h1>Welcome to our app, ${safeName}!</h1>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});