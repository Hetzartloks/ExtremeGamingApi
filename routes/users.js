// routes/users.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/usersController');
const auth    = require('../middlewares/authMiddleware');

router.get('/me', auth, ctrl.getProfile);
router.put('/me', auth, ctrl.updateProfile);

module.exports = router;
