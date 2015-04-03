/* 
 * @description error handling routines
 */
function errHandle () {

	var express = require('express');
	var app = express();

	//set jade as view engine
	app.set('view engine', 'jade');

	//set view template directory
	app.set('views', __dirname + '/views');

	//error handling, (grab anything not defined)
	app.get('*', function(req, res, next) {
		var err = new Error();
		err.status = 404;
		next(err);
	});

	//handle 404 errors
	app.use(function(err, req, res, next) {
		if(err.status !== 404) {
			return next();
		}
		res.status('404');
		res.render('error', {
				message:'Error ' + err.status +':file not found',
				error:{} //don't leak stack
			});
	});

	//other errors, with option for stack printout
	if (app.get('env') === 'development') {
			app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: 'Server Error, error object below:',
				error: JSON.stringify(err)
			});
		});
	}
	else {
		//production error handler, no stacktraces leaked to user
		app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', { 
				message: err.message,
				error: {} //don't leak stacktrace
			});
		});
	}

	return app;
}

module.exports = errHandle;
