// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var app = express();
var handlebars = require('express-handlebars');
var SoundCloudAPI = require('soundcloud-node');
var request = require('request');
var _ = require('underscore');
var flash = require('connect-flash');
var soundfeedApi = require('./api/soundfeed-api');
var nodeConfig = require('cloud-env');


var memjs = require('memjs');

console.log('Setting up Memcached');
var memcachedOpts = JSON.parse(process.env.MEMCACHED);
if (memcachedOpts.username && memcachedOpts.password) {
	var memcacheClient = memjs.Client.create(memcachedOpts.host + ':' +memcachedOpts.port, {
		username: memcachedOpts.username,
		password: memcachedOpts.password
	});
}
else {
	var memcacheClient = memjs.Client.create(memcachedOpts.host + ':' +memcachedOpts.port);
}

// memcacheClient.on('connect', function() {
// 	console.log('Memcached Connected');
// });
// memcacheClient.on('error', function(e) {
// 	console.log('Could not connect to Memcached: ' + e);
// });
// memcacheClient.connect();

app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(__dirname + '/public'));

app.engine('.html', handlebars());
app.engine('.rss', handlebars());

app.get('/', function(req, res){
	var flash = req.flash();
	res.locals.flash = flash;

	res.render('index.html');
});

app.post('/rss/generate', function(req, res) {
	if (soundfeedApi.isValidUrl(req.body.url)) {
		req.flash('feedUrl', soundfeedApi.getFeedUrl(req.body.url));
	}
	else {
		req.flash('error', 'The URL you requested is not a valid SoundCloud URL!');
	}
	
	res.redirect('/');
});

app.get('/feed/:user/:code', function(req, res) {
	var cacheKey = req.params.user + req.params.code;
	memcacheClient.get(cacheKey, function(error, result) {
		if (result) {
			res.locals.data = JSON.parse(result);

			console.log(res.locals.data);

			res.render('feed.rss');
		}
		else {
			request('http://api.soundcloud.com/users/' +  req.params.user + '.json?client_id=' + process.env.SC_CLIENT_ID, function(err, response, userData) {
				request('http://api.soundcloud.com/users/' +  req.params.user + '/tracks.json?client_id=' + process.env.SC_CLIENT_ID, function(err, response, data) {
					if (err) {
						res.send("ERROR: " + err);
					}

					userData = JSON.parse(userData);
					data = JSON.parse(data);

					var items = _.map(data, function(item) {
						return {
							trackTitle: item['title'],
							trackDescription: item['description'],
							trackPageUrl: item['permalink_url'],
							trackSize: item['original_content_size'],
							trackUrl: item['stream_url'].replace('https','http') + '?client_id=' + process.env.SC_CLIENT_ID
						} 
					});

					res.locals.data = {
						channelUrl: userData['permalink_url'].replace('https','http'),
						coverUrl: userData['avatar_url'].replace('https','http'),
						items: items
					}

					memcacheClient.set(cacheKey, JSON.stringify(res.locals.data), function() {}, 20)

					res.set('Content-Type', 'application/xml');
					res.render('feed.rss');
				});
			});
		}
		
	});

	
})

app.listen(nodeConfig.PORT, nodeConfig.IP);