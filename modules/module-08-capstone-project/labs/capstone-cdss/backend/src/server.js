const app = require('./app');

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Capstone CDSS backend listening on http://localhost:${PORT}`);
});
