var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var request = require('request');
var asyncLoop = require('node-async-loop');


//defining variables
var app = express();
var db;

//defining body parser just in case
app.use(bodyParser.urlencoded({ extended: true }));

//connect to database
MongoClient.connect('mongodb://naztyBoi:testing123@ds127731.mlab.com:27731/savedusers', function(err, database) {
    if (err) return console.log(err);

    db = database;
    app.listen(process.env.PORT || 3100);
});

//app.listen(3100);

app.use(express.static('public'))
//define route for calling the functions
app.get('/info/:name', function(req, res) {
	//calls main function with callbacks
    summonerLookup(req.params.name, function(id) {
        getTopChamps(req.params.name, id, getChampData)
        //getCurrentMatch(req.params.name, id)
    })
    //search database for info and send a JSON out as a response
    db.collection("users").findOne({ name: req.params.name }, function(err, result) {
        //console.log(result)
        data = result
            //console.log(data)
        res.json(data)
    })
})


var API_KEY = "RGAPI-7eedb468-1a8e-4cd8-9dac-4e24bd810ddf";


//function that finds a user's account info based on their summoner name
function summonerLookup(sumName, cb) {
    //sumName = 'pants are dragon'
    var summonerID;
    var sumData;
    var summonerID;
    var accountID;
    var summonerLevel;

    url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + sumName + '?api_key=' + API_KEY;
    request(url, function(error, response, body) {
        sumData = JSON.parse(response.body)
        summonerID = sumData.id;
        accountID = sumData.accountId;
        //console.log(summonerID)
        summonerLevel = sumData.level;
        cb(summonerID);
        //console.log(champData)
        //return champData
    })

}

//gets champion names for an array of champion info passed in. uses champion IDs to get the names
function getChampData(champData) {
    var id1, id2, id3;
    id1 = champData["champ1"].champID;
    id2 = champData["champ2"].champID;
    id3 = champData["champ3"].champID;
    //ids = [id1, id2, id3]
    var data = champData;

    //asynchronous hell
    /*for (i = 0; i <ids.length; i++){
      url = "https://na1.api.riotgames.com/lol/static-data/v3/champions/" + ids[i] + "?api_key=" +API_KEY
      request(url, function(error, response, body){
        champ = JSON.parse(response.body)
        champName = champ.name
        console.log(champName);
        console.log(champData[i])
        console.log(champData[0])
        champData[i].champName = champName
        console.log(champData)
      })
    }
  */
    url = "https://na1.api.riotgames.com/lol/static-data/v3/champions?dataById=true&api_key=" + API_KEY

    request(url, function(error, response, body) {

        champions = JSON.parse(response.body)

        champName1 = champions.data[id1].name
        champName2 = champions.data[id2].name
        champName3 = champions.data[id3].name
            //console.log(champName);
            //console.log(champData[0])
        data["champ1"].champName = champName1
        data["champ2"].champName = champName2
        data["champ3"].champName = champName3

        db.collection('users').insert(data);
    })



}

//function that gets a user's top mastered champions and stores the data in a JSON
function getTopChamps(name, summonerID, cb) {
    //figure out new API
    url = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/' + summonerID + '?api_key=' + API_KEY;
    var champData;

    request(url, function(error, response, body) {
        champData = JSON.parse(response.body)
            //console.log(champData)
        champIDOne = champData[0].championId;
        pointsOne = champData[0].championPoints;
        levelOne = champData[0].championLevel;

        champIDTwo = champData[1].championId;
        pointsTwo = champData[1].championPoints;
        levelTwo = champData[1].championLevel;

        champIDThree = champData[2].championId;
        pointsThree = champData[2].championPoints;
        levelThree = champData[2].championLevel;

        returnData = {
            "name": name,

            "champ1": {
                "champID": champIDOne,
                "points": pointsOne,
                "level": levelOne,
                "champName": ''
            },
            "champ2": {
                "champID": champIDTwo,
                "points": pointsTwo,
                "level": levelTwo,
                "champName": ''
            },
            "champ3": {
                "champID": champIDThree,
                "points": pointsThree,
                "level": levelThree,
                "champName": ''
            }
        }
        cb(returnData)
            //console.log(champData)
            //return(champData)
    })

}





//function that gets information about the current match the user is in. Unfortunately could not pass the data to database for some reason
function getCurrentMatch(name, id) {
    url = "https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/" + id + "?api_key=" + API_KEY

    request(url, function(error, response, body) {
        var playerNames = []
        data = JSON.parse(response.body);
        if (data.status) {
            playerNames = []
        } else {
            //console.log(data)
            matchID = data.gameId;
            participants = data.participants

            var playerIDs = []
            for (i = 0; i < participants.length; i++) {
                name = participants[i].summonerName
                summID = participants[i].summonerId
                playerNames.push(name)
                playerIDs.push(summID)
            }
            console.log(playerNames)
            //db.collection('users').insert({name: playerNames})
        }

        //console.log(playerNames)
        //console.log(playerIDs)
        //console.log(matchID)
        //cb(playerIDs)
    })
}


/*function getAllData(idarray){
  //get champ data for all summoners in the game
  //cannot implement because too many api calls for the key
  asyncLoop(idarray, function(item, next){
  	//console.log("123")
  	//console.log(item)

  	data = getTopChamps(item, getChampData)
  	//console.log(data)
  	next()
  })
 *
  
}

promise.then(function(id){
  getTopChamps(id)
}).then(getChampData())

/
var promise = new Promise(function(resolve, reject){
  var sumName = 'nazzz'
   url = 'https://na1.api.riotgames.com//lol/summoner/v3/summoners/by-name/' + sumName + '?api_key=' + API_KEY;
    request(url, function(error, response, body) {
      if (error) {
        reject(error)
      }
      var sumData = JSON.parse(response.body)
      console.log(sumData);
      var summonerID = sumData.id;
      var accountID = sumData.accountId;
      var summonerLevel = sumData.level;
      resolve(summonerID);
    })
})

*/