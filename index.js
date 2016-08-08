var request = require("request");

function url(){
  return "https://api.github.com/orgs/ga-wdi-exercises/repos?access_token=" + process.env.github_access_token;
}

function repos (callback){
  request( url(), { headers: { "User-Agent": "migrate_to_gitlab" } }, function (err, res, body){
    callback( JSON.parse(body) );
  } )
}

repos( function(repositories){
  console.log(repositories.length);
})
