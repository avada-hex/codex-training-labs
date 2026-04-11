const express = require('express');
const cors = require('cors');
const assessmentRouter = require('./routes/assessment');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api', assessmentRouter);

app.use((err, req, res, next) => {
  console.error('Backend error', err);
  res.status(500).json({ error: 'Unexpected error while running the assessment.' });
});

module.exports = app;
