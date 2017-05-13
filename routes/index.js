var express = require('express');
var handlers = require('../handlers/recommendations');
var router = express.Router();

router.get('/recommendation', function(req, res, next){

  var id = req.query.subtopic;

  handlers.getRecommendation(id, 4, function(err, result){
    if (err)
     res.status(500).send(err);
    else
     res.status(200).send(result);
  });
});

module.exports = router;
