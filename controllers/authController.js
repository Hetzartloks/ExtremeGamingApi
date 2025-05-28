const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const admin    = require('firebase-admin');
const db       = require('../config/firebase');
const usersCol = db.collection('users');

const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } = process.env;

function signToken(payload, expiresIn) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Register
 */
exports.register = async (req, res) => {
  try {
    const { email, password, userName, profileImg } = req.body;
    // chekiar si el correo es real
    const snap = await usersCol.where('email', '==', email).get();
    if (!snap.empty) {
      return res.status(400).json({ message: 'El email ya está en uso.' });
    }
    // contraseña
    const hash = await bcrypt.hash(password, 10);
    // preparar base de datos
    const userData = {
      email,
      password: hash,
      userName: userName || email.split('@')[0],
      profileImg: profileImg || '',
      activo: true,
      refreshTokens: []
    };
    // guardar en Firestore
    const ref = await usersCol.add(userData);
    res.status(201).json({
      id: ref.id,
      email,
      userName: userData.userName,
      profileImg: userData.profileImg,
      activo: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // email
    const snap = await usersCol.where('email', '==', email).get();
    if (snap.empty) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    const doc  = snap.docs[0];
    const user = { id: doc.id, ...doc.data() };
    // verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    // generar tokens
    const payload      = { uid: user.id, email: user.email, userName: user.userName };
    const accessToken  = signToken(payload, JWT_EXPIRES_IN);
    const refreshToken = signToken(payload, JWT_REFRESH_EXPIRES_IN);
    //  refresh token
    await usersCol.doc(user.id).update({
      refreshTokens: [...(user.refreshTokens || []), refreshToken]
    });
    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Refresh access token
 */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Falta refreshToken' });
    }
    // Verificar token y expiration
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    // Checkear token si existe en base de datos
    const doc = await usersCol.doc(payload.uid).get();
    const user = doc.data();
    if (!user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: 'Refresh token inválido' });
    }
    // Generar nuevo access token
    const newAccess = signToken({ uid: payload.uid, email: payload.email, userName: payload.userName }, JWT_EXPIRES_IN);
    res.json({ accessToken: newAccess });
  } catch (err) {
    res.status(403).json({ message: 'Refresh token expirado o inválido' });
  }
};

/**
 * Logout user (invalido y refresh token)
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Falta refreshToken' });
    }
    // refresh token por lista de usuario
    await usersCol.doc(req.user.uid).update({
      refreshTokens: admin.firestore.FieldValue.arrayRemove(refreshToken)
    });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};