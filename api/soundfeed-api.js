var SHA256 = require("crypto-js/sha256");

exports = module.exports = {
	isValidUrl: function(url) {
		if (url.indexOf('https://soundcloud.com/') > -1) {
			return true;
		}
		else {
			return false;
		}
	},

	getFeedUrl: function(url) {

		var urlParts = url.replace('https://','').split('/');
		var user = urlParts[1];

		return '/feed/' + user + "/" + SHA256(user).toString().substring(0,6);
	}
}