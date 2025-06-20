const router = require('express').Router();
const ctrl   = require('../controllers/categoriesController');
const auth = require('../middlewares/authMiddleware');

router.get('/',                   ctrl.list     );  //publico
router.post('/search',            ctrl.getByName);  //publico
router.post('/new',         auth, ctrl.create   );  //privado
router.put('/update',       auth, ctrl.update   );  //privado
router.delete('/delete',    auth, ctrl.remove   );  //privado

module.exports = router;