var express = require('express');
var router = express.Router();
 
var quizController = require('../controllers/quiz_controller');

// Página de entrada (home page)
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

// Autoload de comandos con :quizId
router.param('quizId', quizController.load);  // autoload :quizId

/* GET /author */
router.get('/author', function(req, res, next) {
    res.render('author', {
        name   : 'Álvaro Gómez Hernández',
        picture: '<img src="/images/ALVARO2.GIF" width="100px" alt="Álvaro Gómez">'
    });
});

// Definición de rutas de /quizes
router.get('/quizes',                      quizController.index);
router.get('/quizes/:quizId(\\d+)',        quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);

module.exports = router;