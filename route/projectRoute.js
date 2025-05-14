const router = require('express').Router();
const {authentication,restrictTo} = require('../controller/authController');
const {createProject, getAllProjects, getProjectById,updateProject,deleteProject} = require('../controller/projectController');
router.route('/').post(authentication,restrictTo('1'),createProject).get(authentication,getAllProjects);
router.route('/:id').get(authentication,getProjectById).patch(authentication,updateProject).delete(authentication,deleteProject);
module.exports = router;