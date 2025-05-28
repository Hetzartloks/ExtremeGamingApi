const db = require('../config/firebase'); 
const gamesCol = db.collection('games');

// 1) Listar todos los juegos
exports.list = async (req, res) => {
  try {
    const snapshot = await gamesCol.get();
    const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2) Obtener un juego por ID
exports.getById = async (req, res) => {
  try {
    const doc = await gamesCol.doc(req.params.id).get();
    if (!doc.exists) 
      return res.status(404).json({ message: 'Juego no encontrado' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3) Crear un nuevo juego
exports.create = async (req, res) => {
  try {
    const data = req.body;  
    const docRef = await gamesCol.add(data);
    const newDoc = await docRef.get();
    res.status(201).json({ id: newDoc.id, ...newDoc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4) Actualizar un juego
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    await gamesCol.doc(id).update(req.body);
    const updated = await gamesCol.doc(id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5) Eliminar un juego
exports.remove = async (req, res) => {
  try {
    await gamesCol.doc(req.params.id).delete();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
