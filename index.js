var request = require("request");
var exec    = require("child_process").execSync;
var sys     = require("sys");


function gitHubUrl(){
  return "https://api.github.com/orgs/ga-wdi-exercises/repos?access_token=" + process.env.github_access_token + "&limit=1";
}

function repos (callback){
  request( gitHubUrl(), { headers: { "User-Agent": "migrate_to_gitlab" } }, function (err, res, body) {
    callback( JSON.parse(body) );
  });
}

function createGitLabRepo ( repoName, callback ) {
  var url = "https://gitlab.com/api/v3/projects/?name=" + repoName + "&namespace_id=780958&private_token=" + process.env.gitlab_access_token;
  request( {
    url: url,
    method: "POST"
  }, function(err, res, body){
    callback ( )
  } )

}


repos( function(repositories){
  exec("rm -rf repos/*")

  repositories.forEach(function (repo){

    exec("cd repos && git clone " + repo.clone_url );
    createGitLabRepo( repo.name, function () {
      var remote = "git@gitlab.com:ga-wdi-exercises/" + repo.name + ".git";
      var remoteName = Date.now() + "";
      console.log(remote);
      var bashCommand = "";
      bashCommand += "cd repos/" + repo.name;
      bashCommand += " && git remote add " + remoteName + " " + remote;
      bashCommand += " && git push -f " + remoteName + " solution" ;
      bashCommand += " && cd ../..";
      try {
        exec(bashCommand);
      } catch (e) {
        bashCommand = "cd repos/" + repo.name;
        bashCommand += " && git push -f " + remoteName + " --all" ;
        bashCommand += " && cd ../..";
        try {
          exec(bashCommand);
        } catch (err) {
          console.log( err.stack );
        }
      }

    } )

  })
})
