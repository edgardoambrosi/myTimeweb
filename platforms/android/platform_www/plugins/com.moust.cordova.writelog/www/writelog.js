cordova.define("com.moust.cordova.writelog.WriteLog", function(require, exports, module) {
var exec = require('cordova/exec');

module.exports = {
	write: function(arg0, success, error) {
		console.log('IN WRITE');
		exec(success, error, "WriteLog", "writeLog", [arg0]);
	}
};
});
