var express = require('express');
var multer  = require('multer');
var router = express.Router();
var quizController       = require('../controllers/quiz_controller');
var commentController    = require('../controllers/comment_controller');
var sessionController    = require('../controllers/session_controller');
var statisticsController = require('../controllers/statistics_controller');
var userController = require('../controllers/user_controller');
var favoriteController  = require('../controllers/favorite_controller');


// Página de entrada (home page)
router.get('/', function(req, res) {
	res.render('index', { 
        title : 'Quiz',
        errors: []
    });
});;

// Autoload de comandos con ids
router.param('quizId', quizController.load);  // autoload :quizId
router.param('commentId', commentController.load);  // autoload :commentId
router.param('userId', userController.load);  // autoload :userId

// Definición de rutas de sesion
router.get('/login',  sessionController.new);     // formulario login
router.post('/login', sessionController.create);  // crear sesión
router.get('/logout', sessionController.destroy); // destruir sesión

// Definición de rutas de cuenta
router.get('/user',  userController.new);     // formulario sign un
router.post('/user',  multer({ dest: './public/media/'}), userController.create);     // registrar usuario
router.get('/user/:userId(\\d+)/edit',  sessionController.loginRequired, userController.ownershipRequired, userController.edit);     // editar información de cuenta
router.put('/user/:userId(\\d+)',  sessionController.loginRequired, userController.ownershipRequired, multer({ dest: './public/media/'}), userController.update);     // actualizar información de cuenta
router.delete('/user/:userId(\\d+)',  sessionController.loginRequired, userController.ownershipRequired, userController.destroy);     // borrar cuenta
router.get('/users', sessionController.loginRequired, userController.users);
router.get('/user/:userId(\\d+)/profile', sessionController.loginRequired, userController.profile);

/* GET /author */
router.get('/author', function(req, res, next) {
    res.render('author', {
        name   : 'ALVARO GOMEZ HERNANDEZ',
        picture: '<img src="/images/ALVARO2.gif" id="yo" width="100px" alt="ALVARO GOMEZ HERNANDEZ">',
        errors: []
    });
});

/* Definición de rutas de favoritos */
// ver los favoritos de un usuario
router.get('/user/:userId(\\d+)/favorites',
    favoriteController.show);
router.put('/user/:userId(\\d+)/favorites/:quizId(\\d+)',
    sessionController.loginRequired,
    favoriteController.update);
router.delete('/user/:userId(\\d+)/favorites/:quizId(\\d+)',
    sessionController.loginRequired,
    favoriteController.destroy);

/* Definición de rutas de /quizes */
router.get('/quizes',                      quizController.index);
router.get('/quizes/:quizId(\\d+)',        quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/quizes/new',                  sessionController.loginRequired, quizController.new);
router.post('/quizes/create',              sessionController.loginRequired, multer({ dest: './public/media/'}), quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',   sessionController.loginRequired, quizController.ownershipRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)',        sessionController.loginRequired, quizController.ownershipRequired, multer({ dest: './public/media/'}), quizController.update);
router.delete('/quizes/:quizId(\\d+)',     sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);

// ver las preguntas de un usuario
router.get('/user/:userId(\\d+)/quizes', quizController.index);

// Definición de rutas de comentarios
router.get('/quizes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',    commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', 
    sessionController.loginRequired, commentController.ownershipRequired, commentController.publish);

/* Definición de rutas de estadísticas */
router.get('/quizes/statistics', statisticsController.statistics);

module.exports = router; 
