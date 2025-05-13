const router = require("express").Router();
const {signup} = require("../controller/authController");
const {login} = require("../controller/authController");
router.route('/signup').post(signup);
router.route('/login').post(login);

module.exports = router;