const db = require('../config/firebase'); 
const categoriesCol = db.collection('categories');

// Listar todos las categorias
async function list(req, res){
    try{
        const snapshot = await categoriesCol.get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.status(200).json(categories);

    }catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
};

// Obtener una categoria por su nombre
async function getByName(req, res){
    try{
        // Get title del cuerpo en json
        const title = req.query.title;
        if (title === undefined || title === "" || title === "undefined") {
            return res.status(200).json([])
        }

        //filtro de categorias por texto ingresado
        const snapshot = await categoriesCol.get();
        const filterCategories = snapshot.docs
            .filter(doc => {
                const categoryData = doc.data();
                return categoryData.title &&
                        categoryData.title.toLowerCase().includes(title.toLowerCase());
            }).
            map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(categories => categories.active !== false);

        if(filterCategories.length === 0){
            return res.status(200).json([]);
        }

        res.json(filterCategories)

    } catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
}

// Crear categoria nueva
async function create(req, res){
    try{
        const data = req.body;

        if(!data.title || typeof data.title !== 'string' || data.title.trim() === ''){
            return res.status(400).json({ error: "Categoria debe de tener un titulo válido"});
        }

        // Validación del tipo booleano para active
        if(data.hasOwnProperty('active') && typeof data.active !== 'boolean'){
            return res.status(400).json({ error: "La propiedad 'active' debe ser un booleano (true/false)" });
        }

        const titleSnapshot = await categoriesCol.where('title', '==', data.title.trim()).get();
        if(!titleSnapshot.empty){
            return res.status(409).json({ error: `Error, ya existe una categoria con el titulo: ${data.title}`});
        }

        const categoryData = {
            title: data.title.trim(),
            description: data.description ? data.description.trim() : '',
            active: typeof data.active === 'boolean' ? data.active : true // Valor predeterminado true
        };

        const docRef = await categoriesCol.add(categoryData);
        const newDoc = await docRef.get();

        res.status(201).json({ id: newDoc.id, ...newDoc.data()});

    } catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
};

// Actualizar una categoria
async function update(req, res){
    try{
        const id = req.query.id;
        if(!id){
            return res.status(400).json({error: `Falta el parámetro 'id' en la query`});
        }

        const docRef = categoriesCol.doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({error: "Categoría no encontrada"});
        }

        // Validación de datos
        const updateData = {};
        if (req.body.hasOwnProperty('title')) {
            if (typeof req.body.title !== 'string' || req.body.title.trim() === "") {
                return res.status(400).json({error: "El campo 'title' debe ser un string no vacío."});
            }
            updateData.title = req.body.title.trim();
        }
        if (req.body.hasOwnProperty('description')) {
            if (typeof req.body.description !== 'string' || req.body.description.trim() === "") {
                return res.status(400).json({error: "El campo 'description' debe ser un string no vacío."});
            }
            updateData.description = req.body.description.trim();
        }
        if (req.body.hasOwnProperty('active')) {
            if (typeof req.body.active !== 'boolean') {
                return res.status(400).json({error: "El campo 'active' debe ser booleano."});
            }
            updateData.active = req.body.active;
        }

        await docRef.update(updateData);

        res.status(200).json({ id, ...updateData });

    } catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
};

// "Eliminar" una categoria (solo desactiva)
async function remove(req, res){
    try{
        const id = req.query.id;
        if(!id){
            return res.status(400).json({error: `Falta el parámetro 'id' en la query`});
        }

        await categoriesCol.doc(id).update({active: false});
        const updated = await categoriesCol.doc(id).get();

        res.status(200).json({message: `Categoría desactivada correctamente`, id: updated.id, ...updated.data()});
    }catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
}

//exportacion de las funciones
module.exports={
    list,
    getByName,
    create,
    update,
    remove
}