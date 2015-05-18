var models = require('../models/models.js');

/* Autoload :id */
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error);});
};


/* GET /quizes */
exports.index = function(req, res) {
    var cad = "";
    if (req.query.search === undefined)
    {
        models.Quiz.findAll().then(function(quizes) {
            res.render('quizes/index', {
                quizes: quizes,
                errors: []
            });
        }).catch(function(error) {
            next(error);
        });
    }
    else
    {
        cad = '%' + req.query.search + '%';
        cad = cad.replace(/\s/g, '%');
        models.Quiz.findAll( {
            where: ['pregunta like ?', cad],
            order: ['pregunta']
        }).then(function(quizes) {
            res.render('quizes/index', {
                quizes: quizes,
                errors: []
            });
        }).catch(function(error) {
            next(error);
        });
    }
 };

/* GET /quizes/:id */
exports.show = function(req, res) {
    res.render('quizes/show', { 
        quiz: req.quiz
        quiz: req.quiz,
        errors: []
    });
};

/* GET /quizes/:id/answer */
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta) {
        resultado = 'Correcto';
    }
    res.render('quizes/answer', {
        quiz     : req.quiz,
        respuesta: resultado,
        errors: []
     });
 };

/* GET /quizes/new */
exports.new = function(req, res) {
    // crea objeto quiz
    var quiz = models.Quiz.build( {
        pregunta : "Pregunta",
        respuesta: "Respuesta"
    });
     res.render('quizes/new', {
        quiz: quiz,
        errors: []
     });
 };

/* POST /quizes/create */
exports.create = function(req, res) {
    var quiz = models.Quiz.build(req.body.quiz);

    // guarda en DB los campos pregunta y respuesta de quiz
    quiz.save( {
        fields: ["pregunta", "respuesta"]
    }).then(function() {
        // redirección HTTP a lista de preguntas
        res.redirect('/quizes');
    quiz.validate().then(function(err) {
        if (err)
        {
            res.render('quizes/new', {
                quiz  : quiz,
                errors: err.errors
            });
        }
        else
        {
            // guarda en DB los campos "pregunta" y "respuesta" de quiz
            quiz.save( {
                fields: ["pregunta", "respuesta"]
            }).then(function() {
                // redirección HTTP a lista de preguntas
                res.redirect('/quizes');
            });
        }
     });
 };