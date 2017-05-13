var dbUtils = require('../utilities/database/dbUtils.js')
var ProgressBar = require('progress');

var startSetupProcess = function(cb){
  var recommendations = require("../listens.json");
 
  var userHistory = dbUtils.get().collection('userHistory');
  var subTopicMapping = dbUtils.get().collection('subTopicMapping');
  console.log("Removing old user history...");
  userHistory.remove({}, function(err, result){
    if (err)
      return cb(err, null);

    console.log("Removing old mappings...");
    subTopicMapping.remove({}, function(err, result){
      if (err)
        return cb(err, null);

      console.log("Inserting collections...");
      userHistory.insert(recommendations, function(err, result){
        if (err)
          return cb(err, null);
        
        console.log("Constructing map...");
        userHistory.aggregate(
          [
           {$group:{_id: "$subtopic"}}, 
          ], function (err, subtopics){
            let maps = [];
            let count = 0;
            let totalLength = subtopics.length * (subtopics.length-1);
            var bar = new ProgressBar(':bar', { total: totalLength });
            for (let i=0; i<subtopics.length; i++){
              for (let j=0; j<subtopics.length; j++){
                if (i != j){
                  userHistory.aggregate(
                    [
                      {$group:{_id: {user: "$user"}, 'songs': {$push:"$subtopic"}}}, 
                      {$match:{'songs': {$all: [subtopics[i]._id,subtopics[j]._id]}}}, 
                      {$group:{_id:null, count: {$sum:1}}}
                    ], function(err, result){
                        count++;
                        bar.tick();
                        if (result.length>0){
                          subTopicMapping.insert({
                            'i': subtopics[i]._id,
                            'j': subtopics[j]._id,
                            'count': result[0].count
                          }, function(err, result){
                            if (err)
                              //Dont return; Process other entries
                              console.log(err)
                          })
                        }

                        if (count == totalLength)
                          return cb(null, 'Finished setup...');
                      }
                  )
                }
              }
            }            
          }
        )
      })
    })
  })

}
    
var getRecommendation = function(subtopicId, topN, cb){

  var subTopicMapping = dbUtils.get().collection('subTopicMapping');
  subTopicMapping.aggregate(
    [
      {$match:{'i': subtopicId}}, 
      {$sort : { count: -1 }},
      {$project: {'_id': 0, 'subtopic':'$j', 'count': 1}}
    ], function(err, result){
        if (err)
          cb(err, null);
        else {
          if (result.length < topN)
            cb(null, result);
          else
            cb(null, result.slice(0, topN)); 
        }
        
      }
  )

}




module.exports.startSetupProcess = startSetupProcess;
module.exports.getRecommendation = getRecommendation;
