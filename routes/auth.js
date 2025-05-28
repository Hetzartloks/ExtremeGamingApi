// routes/auth.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const auth    = require('../middlewares/authMiddleware');

// Registro de usuario
router.post('/register', ctrl.register);

// Login
router.post('/login',    ctrl.login);

// Refresh de token
router.post('/refresh',  ctrl.refresh);

// Logout - elimina el refreshToken del usuario
// Debes enviar en el body: { "refreshToken": "<el_token_a_eliminar>" }
router.post('/logout',   auth, ctrl.logout);

module.exports = router;

