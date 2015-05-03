var express = require('express');
var router = express.Router();
 
var quizController = require('../controllers/quiz_controller');

/* GET home page */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

/* GET /author */
router.get('/author', function(req, res, next) {
    res.render('author', {
        name   : 'Álvaro Gómez Hernández',
        picture: '<img src="/images/ALVARO2.gif" width="100px" alt="Mikel Goig">'
    });
});

/* GET /quizes/question */ 
router.get('/quizes/question', quizController.question);

/* GET /quizes/answer */
router.get('/quizes/answer',   quizController.answer)

module.exports = router;