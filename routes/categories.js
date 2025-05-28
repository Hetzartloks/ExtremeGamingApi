const router = require('express').Router();
const ctrl   = require('../controllers/categoriesController');

router.get('/',         ctrl.list       );
router.post('/search',  ctrl.getByName  );
router.post('/',        ctrl.create     );
router.put('/:id',      ctrl.update     );
router.delete('/:id',   ctrl.remove     );

module.exports = router;