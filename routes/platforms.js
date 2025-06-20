const router = require('express').Router();
const ctrl   = require('../controllers/platformController');
const auth = require('../middlewares/authMiddleware');

router.get('/',               ctrl.list     );  //publico
router.get('/search',         ctrl.getByName);  //publico
router.post('/new',     auth, ctrl.create   );  //private
router.post('/update',  auth, ctrl.update   );  //private
router.delete('/delete',  auth, ctrl.remove   );  //private

module.exports = router;