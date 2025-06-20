// server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authR  = require('./routes/auth');
const usersR = require('./routes/users');
const gamesR = require('./routes/games');
const categoriesR = require('./routes/categories');
const platformsR = require('./routes/platforms');

const app = express();


app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth',  authR);           // Registro, login, refresh
app.use('/api/users', usersR);          // Perfil protegido (me, update)
app.use('/api/games', gamesR);          // CRUD de juegos
app.use('/api/categories', categoriesR) // CRUD de categorias
app.use('/api/platforms', platformsR)   // CRUD de plataformas

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
