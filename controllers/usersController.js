// controllers/usersController.js
const db       = require('../config/firebase');
const usersCol = db.collection('users');

exports.getProfile = async (req, res) => {
  const doc = await usersCol.doc(req.user.uid).get();
  if (!doc.exists) return res.status(404).json({ message: 'Usuario no encontrado' });
  const data = doc.data();
  res.json({
    id:        req.user.uid,
    email:     data.email,
    userName:  data.userName,
    profileImg:data.profileImg,
    activo:    data.activo
  });
};

exports.updateProfile = async (req, res) => {
  const updates = {};
  if (req.body.userName)   updates.userName  = req.body.userName;
  if (req.body.profileImg) updates.profileImg = req.body.profileImg;
  await usersCol.doc(req.user.uid).update(updates);
  res.json({ message: 'Perfil actualizado' });
};
