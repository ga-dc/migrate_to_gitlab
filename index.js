var request = require("request");
var exec    = require("child_process").execSync;
var sys     = require("sys");


function url(){
  return "https://api.github.com/orgs/ga-wdi-exercises/repos?access_token=" + process.env.github_access_token + "&limit=1";
}

function repos (callback){
  request( url(), { headers: { "User-Agent": "migrate_to_gitlab" } }, function (err, res, body){
    callback( JSON.parse(body).map(function (repo) {
      return repo.clone_url;
    }) );
  } )
}

repos( function(repositories){
  exec("rm -rf repos/*")
  repositories.forEach(function (repo){
    console.log( exec("cd repos && git clone --depth=1 " + repo + " && cd ..") );
  })
})
