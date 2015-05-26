var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
  var objQuizOwner = req.quiz.UserId;
  var logUser = req.session.user.id;
  var isAdmin = req.session.user.isAdmin;

  if (isAdmin || objQuizOwner === logUser) {
    next();
  } else {
    res.redirect('/');
  }
};

/* Autoload :id */
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: {
                id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId = ' + quizId)); }
    }
  ).catch(function(error) { next(error);});
};

/* GET /quizes */
/* GET /users/:userId/quizes */
exports.index = function(req, res) {
  var options = {};
  if(req.user)  {
    options.where = {
      UserId: req.user.id
    }
  }
  var cad = "";
  var mark     = [];
  var favorites = [];
  if(req.session.user)  {
    models.Favorite.findAll( {
      where: {
        UserId: Number(req.session.user.id)
      }
    }).then(function(f) {
      favorites = f;
      if(req.query.cad === undefined)  {
        models.Quiz.findAll(options).then(function(quizes) {
          for(j in quizes)  {
            mark[j] = 'unchecked';
            for(k in favorites)  {
              if(favorites[k].QuizId === quizes[j].id) {
                mark[j] = 'checked';
              }
            }
          }
          res.render('quizes/index', {
            quizes: quizes,
            mark: mark,
            errors: []
          });
        }).catch(function(error) {
          next(error);
        });
      }
      else  {
        cad = '%'+ req.query.cad + '%';
        cad = cad.replace(/ /g, '%');
        models.Quiz.findAll( {
          where: ["pregunta like ?", cad],
          order: ['pregunta']
        }).then(function(quizes) {
          for(j in quizes)  {
            mark[j] = 'unchecked';
            for(k in favorites)  {
              if(favorites[k].QuizId === quizes[j].id) {
                mark[j] = 'checked';
              }
            }
          }
          res.render('quizes/index', {
            quizes: quizes,
            mark: mark,
            errors: []
          });
        }).catch(function(error) {
          next(error);
        });
      }
    });
  }
  else  {
    if(req.query.cad === undefined)  {
      models.Quiz.findAll(options).then(function(quizes) {
        res.render('quizes/index', {
          quizes: quizes,
          mark: mark,
          errors: []
        });
      }).catch(function(error) {
        next(error);
      });
    }
    else  {
      cad = '%' + req.query.cad + '%';
      cad = cad.replace(/ /g, '%');
      models.Quiz.findAll( {
        where: ["pregunta like ?", cad],
        order: ['pregunta']
      }).then(function(quizes) {
        res.render('quizes/index', {
          quizes: quizes,
          mark: mark,
          errors: []
        });
      }).catch(function(error) {
        next(error);
      });
    }
  }
};

// GET /quizes/:id
exports.show = function(req, res) {
  var mark = 'unchecked';
  if(req.session.user)  {
    models.Favorite.find( {
      where: {
        UserId: Number(req.session.user.id),
        QuizId: Number(req.quiz.id)
      }
    }).then(function(favorite) {
      if(favorite) {
        mark = 'checked';
      }
      res.render('quizes/show', {
        quiz: req.quiz,
        mark: mark,
        errors: []
      });
    });
  }
  else  {
    res.render('quizes/show', {
      quiz: req.quiz,
      mark: mark,
      errors: []
    });
  }
};            // req.quiz: instancia de quiz cargada con autoload

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

// POST /quizes/create
exports.create = function(req, res) {
  req.body.quiz.UserId = req.session.user.id;
  if(req.files.image){
    req.body.quiz.image = req.files.image.name;
  }
  var quiz = models.Quiz.build( req.body.quiz );
  quiz
  .validate()
  .then(
  function(err){
    if (err) {
      res.render('quizes/new', {quiz: quiz, errors: err.errors});
    } else {
      quiz // save: guarda en DB campos pregunta y respuesta de quiz
      .save({fields: ["pregunta", "respuesta", "UserId", "image"]})
      .then( function(){ res.redirect('/quizes')}) 
    }      // res.redirect: Redirección HTTP a lista de preguntas
  }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  if(req.files.image){
    req.quiz.image = req.files.image.name;
  }
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
    .validate()
    .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
          .save( {fields: ["pregunta", "respuesta", "image"]})
          .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

//  console.log("req.quiz.id: " + req.quiz.id);