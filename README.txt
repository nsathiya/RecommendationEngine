README

Instructions to start server
 1. npm install
 2. export MONGO_URL="mongodb://testuser:123456@aws-us-west-2-portal.0.dblayer.com:15834,aws-us-west-2-portal.1.dblayer.com:15834/simpleHabit?ssl=true"
 3. node app.js || npm start

(Please wait for ~30 mins to construct map and prepare DB)

Instructions to use recommendations
 1. Send a GET request to http://localhost:3000/recommendation?subtopic=<SUBTOPIC ID>
 	ex. http://localhost:3000/recommendation?subtopic=579453a2617941030070d9d7


Logic: 

Using conditional probability to calculate the score for each subtopic and all other subtopics. So given subtopic A, we need to find 
P(B|A) for all other subtopics B. Since P(B|A) = P(A and B)/ P(A), and P(A) will stay the same for all subtopics A, we just need to cache values for all sets of P(A and B).

First, I save the listening sessions, then use MongoDB aggregation functions to find which subtopics each user has listened to. Then I use another aggregation pipeline to find which user has listened to both subtopic A and subtopic B for every subtopic. This is the most expensive operation. I then save each entry.

Then when a new request is received for subtopic A, every entry for A is pulled and the top 4 counts (which gives the highest A and B counts) are returned.
