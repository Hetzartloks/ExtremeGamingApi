const db = require('../config/firebase'); 
const categoriesCol = db.collection('categories');

// Listar todos las categorias
async function list(req, res){
    try{
        const snapshot = await categoriesCol.get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.json(categories);

    }catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
};

// Obtener una categoria por su nombre
async function getByName(req, res){
    try{
        // Get title del cuerpo en json
        const { title } = req.body;
        
        if(!title){
            return res.status(400).json({error: "Titulo de categoria requerido en Body json"});
        }

        //filtro de categorias por texto ingresado
        const snapshot = await categoriesCol.get();
        const filterCategories = snapshot.docs
            .filter(doc => {
                const categoryData = doc.data();
                return categoryData.title &&
                        categoryData.title.toLowerCase().includes(title.toLowerCase());
            }).
            map(doc => ({ id: doc.id, ...doc.data() }));

        if(filterCategories.length === 0){
            return res.status(404).json({error: `No se encontraron categorías que contengan: ${title}`});
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

// Actualizar una categoria (poco necesaria, pero.. ¿y si?)
async function update(req, res){
    try{
        const id = req.params.id;
        const { id: bodyId, ...updateData } = req.body;
        await categoriesCol.doc(id).update(updateData);
        const updated = await categoriesCol.doc(id).get();

        res.json({ id: updated.id, ...updated.data() });
    } catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
};

// Eliminar una categoria (no deberia de ser usadad, pero.. ¿y si?)
async function remove(req, res){
    try{
        const id = req.params.id;
        const categoryDoc = await categoriesCol.doc(id).get();

        const categoryData = categoryDoc.data();

        await categoriesCol.doc(id).delete();

        res.status(200).json({ message: `Categoria "${categoryData.title}" eliminada satisfactoriamente` });

    } catch(err) {
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
};

//exportacion de las funciones
module.exports={
    list,
    getByName,
    create,
    update,
    remove
}