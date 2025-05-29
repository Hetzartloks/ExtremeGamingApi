const db = require('../config/firebase'); 
const gamesCol = db.collection('games');
const categoriesCol = db.collection('categories');

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

exports.getByName = async (req, res) => {
  try {
    const {title} = req.body;

    if(!title){
      return res.status(400).json({error: "Titulo de juego requerido en Body json"});
    }

    const snapshot = await gamesCol.get();
    const filterGames = snapshot.docs
      .filter(doc => {
        const gamesData = doc.data();
        return gamesData.title &&
               gamesData.title.toLowerCase().includes(title.toLowerCase());
      })
      .map(doc => ({ id: doc.id, ...doc.data() }));
    
    if(filterGames.length === 0){
      return res.status(404).json({error: `No se encontraron juegos que contengan: ${title}`});
    }

    res.json(filterGames);

  } catch (err) {
    res.status(500).json({ error: `Error en el servidor: ${err.message}`});
  }
};

// 3) Crear un nuevo juego
exports.create = async (req, res) => {
  try {
    const data = req.body;

    if(!data.title || !data.description || !data.developer || !data.category || !data.price || !data.coverImg){
      return res.status(400).json({error: "Faltan campos requeridos para crear el juego"})
    }

    // Esquema de validaciones
    const validations = [
      { field: 'title', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'El título debe ser un texto válido' },
      { field: 'description', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'La descripción debe ser un texto válido' },
      { field: 'developer', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'El desarrollador debe ser un texto válido' },
      { field: 'category', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'La categoría debe ser un texto válido' },
      { field: 'price', validate: val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, message: 'El precio debe ser un número positivo' },
      { field: 'coverImg', validate: val => typeof val === 'string' && /^https?:\/\/.+/.test(val), message: 'La imagen de portada debe ser una URL válida' },
      { field: 'discount', validate: val => val === undefined || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100), message: 'El descuento debe ser un número entre 0 y 100' },
      { field: 'stock', validate: val => val === undefined || (typeof val === 'number' && val >= 0), message: 'El stock debe ser un número no negativo' },
      { field: 'active', validate: val => val === undefined || typeof val === 'boolean', message: 'El campo active debe ser un valor booleano' }
    ];

    // Ejecucion de validaciones
    for (const {field, validate, message} of validations) {
      if (!validate(data[field])) {
        return res.status(400).json({error: message});
      }
    }

    // Verificacion de duplicidad
    const titleSnapshot = await gamesCol.where('title', '==', data.title.trim()).get();
    if(!titleSnapshot.empty){
      return res.status(409).json({error: `Error, ya existe un juego con el titulo: ${data.title}`});
    }

    // Verificacion de pre existencia de categoria
    const catTitleSnapshot = await categoriesCol.where('title', '==', data.category.trim()).get();
    if(catTitleSnapshot.empty){
      return res.status(400).json({error: `Error: Categoria no existe`});
    }

    const gamesData = {
      title: data.title,
      description: data.description,
      developer: data.developer,
      category: data.category,
      coverImg: data.coverImg,
      price: parseFloat(data.price),
      discount: data.discount !== undefined ? parseFloat(data.discount) : data.discount,
      stock: typeof data.stock === 'number' ? data.stock : 0,
      active: typeof data.active === 'boolean' ? data.active : true
    };
    
    const docRef = await gamesCol.add(gamesData);
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
