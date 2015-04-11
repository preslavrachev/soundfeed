var memcache = require('memcache');

exports = module.exports = function() {

	console.log('Setting up Memcached');
var memcacheClient = memcache.Client();
memcacheClient.on('connect', function() {
	console.log('Memcached Connected');
});
memcacheClient.on('error', function(e) {
	console.log('Could not connect to Memcached: ' + e);
});
memcacheClient.connect();

	return {
		connect: function() {

		}
	}

}