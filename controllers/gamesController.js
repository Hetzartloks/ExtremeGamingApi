const db = require('../config/firebase'); 
const gamesCol = db.collection('games');
const categoriesCol = db.collection('categories');
const platformsCol = db.collection('platforms');

// 1) Listar todos los juegos
async function list(req, res){
  try {
    const snapshot = await gamesCol.get();
    const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3) Crear un nuevo juego
async function create(req, res){
  try {
    const data = req.body;

    if(
      !data.title ||
      !data.description ||
      !data.developer ||
      !data.category ||
      !data.platform ||
      !data.price ||
      !data.coverImg
    ){
      return res.status(400).json({error: "Faltan campos requeridos para crear el juego"});
    }

    // Esquema de validaciones
    const validations = [
      { field: 'title', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'El título debe ser un texto válido' },
      { field: 'description', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'La descripción debe ser un texto válido' },
      { field: 'developer', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'El desarrollador debe ser un texto válido' },
      { field: 'category', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'La categoría debe ser un texto válido' },
      { field: 'platform', validate: val => typeof val === 'string' && val.trim().length > 0, message: 'La plataforma debe ser un texto válido' },
      { field: 'price', validate: val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, message: 'El precio debe ser un número positivo' },
      { field: 'coverImg', validate: val => typeof val === 'string' && (/^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/.test(val) || /^[A-Za-z0-9+/=]+$/.test(val)), message: 'La imagen de portada debe ser una cadena base64 válida' },
      { field: 'discount', validate: val => val === undefined || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100), message: 'El descuento debe ser un número entre 0 y 100' },
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

    // Verificacion de pre existencia de plataforma
    const platTitleSnapshot = await platformsCol.where('title', '==', data.platform.trim()).get();
    if(platTitleSnapshot.empty){
      return res.status(400).json({error: `Error: Plataforma no existe`});
    }

    const gamesData = {
      title: data.title,
      description: data.description,
      developer: data.developer,
      category: data.category,
      platform: data.platform,
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
async function update(req, res){
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
async function remove(req, res){
  try {
    await gamesCol.doc(req.params.id).delete();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function filter(req, res) {
  try {
    const { title, category, platform, price } = req.query;

    if (
      (!title || title.trim() === "") &&
      (!category || category.trim() === "") &&
      (!platform || platform.trim() === "") &&
      (!price || price.trim() === "")
    ) {
      return res.status(400).json({ error: "Debes enviar al menos 'title', 'category', 'platform' o 'price' en la query" });
    }

    const snapshot = await gamesCol.get();
    let games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (title && title.trim() !== "") {
      games = games.filter(game =>
        game.title && game.title.toLowerCase().includes(title.toLowerCase())
      );
    }

    if (category && category.trim() !== "") {
      games = games.filter(game =>
        game.category && game.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (platform && platform.trim() !== "") {
      games = games.filter(game =>
        game.platform && game.platform.toLowerCase().includes(platform.toLowerCase())
      );
    }

    if (price && !isNaN(parseFloat(price))) {
      const priceNum = parseFloat(price);
      if (priceNum < 100) {
        return res.status(400).json({ error: "El precio debe ser un número mayor o igual a 100 CLP" });
      }
      games = games.filter(game =>
        typeof game.price === 'number' && game.price <= priceNum
      );
    }

    if (games.length === 0) {
      return res.status(404).json({ error: "No se encontraron juegos con los filtros proporcionados" });
    }

    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ error: `Error en el servidor: ${err.message}` });
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
  filter
}