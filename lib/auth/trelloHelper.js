var Promise = require('bluebird');

module.exports = {
  checkAuth: function(){
    return new Promise(function(resolve, reject){
      Trello.authorize({
        interactive: false,
        success: resolve,
        error: reject
      });
    });
  },
  getUserInfo: function(){
    return new Promise(function(resolve, reject){
      Trello.members.get('me', resolve, reject);
    });
  }
}