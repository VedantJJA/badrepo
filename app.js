import express from 'express';
import { exec } from 'child_process';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INT, username TEXT, password TEXT, secret_note TEXT)");
  db.run("INSERT INTO users VALUES (1, 'admin', 'admin123', 'Super Secret Admin Note')");
  db.run("INSERT INTO users VALUES (2, 'alice', 'password123', 'Alice Personal Note')");
});

const JWT_SECRET = "super_secret_hardcoded_key_12345";

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { algorithm: 'HS256' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});
app.get('/api/users/search', (req, res) => {
  const username = req.query.username;
  const query = `SELECT id, username, secret_note FROM users WHERE username = '${username}'`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

app.get('/api/system/ping', (req, res) => {
  const host = req.query.host;
  exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(stderr || error.message);
    }
    res.send(stdout);
  });
});


app.get('/api/files/download', (req, res) => {
  const fileName = req.query.file;
  const filePath = path.join(__dirname, 'public', fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('File not found or access denied');
    }
    res.send(data);
  });
});

app.get('/welcome', (req, res) => {
  const name = req.query.name || 'Guest';
  res.send(`
    <! baseline html >
    <html>
      <head><title>Welcome</title></head>
      <body>
        <h1>Welcome to our app, ${name}!</h1>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Vulnerable test server running on port ${PORT}`);
});
