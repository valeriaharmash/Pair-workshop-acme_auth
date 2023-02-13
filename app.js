const express = require('express');
const app = express();
const {
  models: { User, Notes },
} = require('./db');
const path = require('path');
require('dotenv').config();

// middleware
app.use(express.json());

// routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
      include: {
        model: Notes,
      },
    });
    if (user) {
      res.send(user);
      return;
    }
    res.status(404).send('Note not found');
  } catch (error) {
    console.error(e);
    next(e);
  }
});

app.post('/api/auth', async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/auth', async (req, res, next) => {
  try {
    res.send(await User.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
