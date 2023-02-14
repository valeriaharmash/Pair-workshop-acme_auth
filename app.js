const express = require('express');
const app = express();
const {
  models: { User, Note },
} = require('./db');
const path = require('path');
require('dotenv').config();

// middleware
async function requireToken(req, res, next) {
  try {
    const token = req.headers.authorization;
    const user = await User.byToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

app.use(express.json());

// routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/auth', requireToken, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/users/:userId/notes', requireToken, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || String(user.id) !== req.params.userId) {
      res.status(401).send('Bad credentials');
      return;
    }
    const notes = await Note.findAll({
      where: {
        userId: req.params.userId,
      },
    });
    res.send(notes);
    return;
  } catch (error) {
    console.error(e);
    next(e);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
