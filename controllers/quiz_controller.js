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
    var quiz = req.quiz;  // req.quiz: instancia de quiz cargada con autoload
    res.render('quizes/show', {
        quiz: quiz,
        errors: []
     });
 };

/* GET /quizes/:id/answer */
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta) {
        resultado = 'Correcto';
    }
    var quiz = req.quiz;
    res.render('quizes/answer', {
        quiz     : quiz,
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

/* GET /quizes/:id/edit */
exports.edit = function(req, res) {
    var quiz = req.quiz;
    res.render('quizes/edit', {
        quiz: quiz,
        errors: []
    });
};

/* PUT /quizes/:id */
exports.update = function(req, res) {
    req.quiz.pregunta  = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.validate().then(function(err) {
        if (err)
        {
            var quiz = req.quiz;
            res.render('quizes/edit', {
                quiz  : quiz,
                errors: err.errors
            });
        }
        else
        {
            // guarda en DB los campos "pregunta" y "respuesta" de req.quiz
            req.quiz.save( {
                fields: ["pregunta", "respuesta"]
            }).then( function() {
                // redirección HTTP a lista de preguntas
                res.redirect('/quizes');
            });
        }
    });
};