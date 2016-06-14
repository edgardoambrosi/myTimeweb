cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.phonegap.plugins.Puship/www/PushNotification.js",
        "id": "com.phonegap.plugins.Puship.PushNotification",
        "pluginId": "com.phonegap.plugins.Puship",
        "clobbers": [
            "PushNotification"
        ]
    },
    {
        "file": "plugins/com.phonegap.plugins.Puship/www/PushipNotification.js",
        "id": "com.phonegap.plugins.Puship.PushipNotification",
        "pluginId": "com.phonegap.plugins.Puship",
        "clobbers": [
            "PushipNotification"
        ]
    },
    {
        "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
        "id": "cordova-plugin-geolocation.geolocation",
        "pluginId": "cordova-plugin-geolocation",
        "clobbers": [
            "navigator.geolocation"
        ]
    },
    {
        "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
        "id": "cordova-plugin-geolocation.PositionError",
        "pluginId": "cordova-plugin-geolocation",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.phonegap.plugins.Puship": "1.0.7",
    "cordova-plugin-compat": "1.0.0",
    "cordova-plugin-geolocation": "2.2.0"
}
// BOTTOM OF METADATA
});