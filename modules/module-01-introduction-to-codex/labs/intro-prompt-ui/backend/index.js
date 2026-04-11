const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const tasks = [];
let nextId = 1;

app.get('/api/tasks', (req, res) => {
  res.json({ tasks });
});

app.post('/api/tasks', (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text) {
    return res.status(400).json({ error: 'Please provide a non-empty task text' });
  }

  const task = { id: nextId++, text };
  tasks.unshift(task);
  res.status(201).json({ task });
});

const port = process.env.PORT || 5200;
app.listen(port, () => {
  console.log(`Todo API listening on http://localhost:${port}`);
});
