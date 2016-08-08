var request = require("request");
var exec    = require("child_process").execSync;
var sys     = require("sys");


function gitHubUrl(){
  return "https://api.github.com/orgs/ga-wdi-exercises/repos?access_token=" + process.env.github_access_token;
}

function repos(callback, foundRepos, next){
  var foundRepos  = foundRepos || [];
  var url = gitHubUrl();
  if (next) {
    url += "&page=" + next;
  }

  request( url, { headers: { "User-Agent": "migrate_to_gitlab" } }, function (err, res, body) {
    JSON.parse(body).forEach(function(repo){
      foundRepos.push(repo);
    })
    var next;
    try {
      next = res.headers.link.match(/<(.*)>; rel="next"/);
      if (next) {
        next = next[1].split("&page=")[1];
      }
    } catch (e) {
      next = undefined;
    }

    if (next) {
      repos(callback, foundRepos, next)
    } else {
      callback( foundRepos );
    }
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
          console.log( "error: see log file for details" );
          var timeAtErr = Date.now() = "";
          exec('echo "' + timeAtErr +
               ' in '   + repo.name +
               ' (remote ' + remoteName +
               '): '     + err.stack +
               '" > error_log.txt') ;
        }
      }

    } )

  })
})
