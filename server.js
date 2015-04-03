/** 
 * @description integrate Google Alerts with a specific user and board
 */

/* 
 * configuration
 * get the key and secret
 * and the port assignment
 */
var config = JSON.parse(require('fs').readFileSync(__dirname +'/config.json', 'utf8'));

/*
 * create an express server, which in turn adds routes
 * handling oAuth via node-trello module
 */
var alerts = require('./lib/app')(config);

/*
 * make the app an express server, and add the 
 * alerts module to it
 */
var express = require('express');
var app = express();
app.use(alerts);


/*
 * set location of static assets 
 * (set here globally for '/public' to be correct)
 */
app.use(express.static(__dirname + '/public'));

/* 
 * some command mapping
 */
var agg = function(eventName) {
	var e = eventName.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
};

['error', 'loginStart', 'loginEnd', 'deauthorize', 
	'calendar', 'calendarAll', 'calendarBoard', 'trelloApiGet', 'trelloApiPut'].forEach(function(eventName) {
		app.on(eventName, function() { agg(eventName); });
		//calendar.on(eventName, function() { agg(eventName); });
});

/*
 * add error handling to the app
 */
var err = require('./lib/err')();
app.use(err);

/*
 * activate the server
 * note: port was set in creating 'alerts', used below
 */
app.listen(alerts.get('port'), function () {
	console.log("listening on port:" + config.port);
});
