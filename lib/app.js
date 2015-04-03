
//Google alerts app

function trelloAlertApp (config) {

	//url
	var url = require('url');

	//protocol
	var httpProtocol = 'http://';

	/* 
	 * add session handling
	 * usage: app.use(session);
	 * @link http://codeforgeek.com/2014/09/manage-session-using-node-js-express-4/
	 */
	var session = require('express-session');

	//express server
	var express = require('express');
	var app = express();
	app.set('appName', config.app.appName); //NOTE: access via app.settings object

	//OAuth request
	//http://tools.ietf.org/html/rfc5849
	//https://trello.com/docs/gettingstarted/oauth.html
	//https://github.com/ciaranj/node-oauth
	//SAMPLE USING TRELLO CLIENT JS (adapt for this)
	//http://metaviewsoft.de/trello.html#
	//this is OAuth 1
	//OAuth 2: https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2

	var OAuth = require('oauth').OAuth;
	var requestURL = "https://trello.com/1/OAuthGetRequestToken"
	var accessURL = "https://trello.com/1/OAuthGetAccessToken"
	var authorizeURL = "https://trello.com/1/OAuthAuthorizeToken"
	var oauth_secrets = {};
	var domain = null; //domain name, get on first page request
	var oa = null; //OAuth object, set after first page requested

	//set the app port
	app.set('port', process.env.PORT || 5000);

	//set jade as view engine
	app.set('view engine', 'jade');

	//set view template directory
	app.set('views', __dirname + '/views');

	/*
	 * routing
	 */

	//default
	app.get('/', function (req, res, next) {

		//TODO: get app domain here for better callback
		host = req.get('host');
		console.log("start for host:" + host);

		app.emit('indexUnlogged');

		if(app.ok) {

			res.render('index_logged', {
				logged: true, 
				https: true, 
				config: config
			});
		}
		else {
			//add the Trello link to the button
			res.render('index_unlogged', {
				logged: false, 
				https: false, 
				config: config
			});
		}

	});

	//start login
	app.get('/login', function (req, res, next) {

		var lCallback = httpProtocol + host + '/cb';

		console.log("oAuth login, callback will be:" + lCallback);
		//console.log("current callback:" + loginCallback);
		app.emit('indexLogin');

		oa = new OAuth(requestURL, accessURL, config.trello.key, config.trello.secret, "1.0", lCallback, "HMAC-SHA1");

		//get the request token, and re-submit URL with token
		oa.getOAuthRequestToken (function (error, token, tokenSecret, results) {
			oauth_secrets[token] = tokenSecret; //stored using non-secret toen as property name
			res.redirect(authorizeURL + '?oauth_token=' + token + '&name=' + app.settings.appName);
			}
		);
	});

	//final destination (after intermediate getOauthRequestToken visit)
	app.get('/cb', function (req, res) {
		var query = url.parse(req.url, true).query;
		var token = query.oauth_token;
		var tokenSecret = oauth_secrets[token]; //stored using non-secret token as property name
		var verifier = query.oauth_verifier;
		console.log("app logged in");

		//default data request while logged in
		oa.getOAuthAccessToken(token, tokenSecret, verifier, 
			function (error, accessToken, accessTokenSecret, results) {
				//in a real app, the token and tokenSecret should be stored
				oa.getProtectedResource("https://api.trello.com/1/members/me", "GET", accessToken, accessTokenSecret, 
					function (error, data, response) {
						//NOTE: result is JSON string (must be parsed to object)
						//return res.end(data);
						res.render('trello_account', {
							result:"good",
							dataStr:data,
							data:JSON.parse(data)
						});
				});
			});
		});


/*
	var reqURL = 'https://trello.com/1/connect?' +
			'key='+config.trello.key +
			'&name='+app.settings.appName +
			'&response_type=token' + 
		'&expiration=' + config.trello.token.expiration;
*/


	return app;
}

module.exports = trelloAlertApp;

