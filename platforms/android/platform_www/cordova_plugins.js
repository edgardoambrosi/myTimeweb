cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-calendar/www/Calendar.js",
        "id": "cordova-plugin-calendar.Calendar",
        "pluginId": "cordova-plugin-calendar",
        "clobbers": [
            "Calendar"
        ]
    },
    {
        "file": "plugins/cordova-plugin-calendar/test/tests.js",
        "id": "cordova-plugin-calendar.tests",
        "pluginId": "cordova-plugin-calendar"
    },
    {
        "file": "plugins/cordova-plugin-flashlight/www/Flashlight.js",
        "id": "cordova-plugin-flashlight.Flashlight",
        "pluginId": "cordova-plugin-flashlight",
        "clobbers": [
            "window.plugins.flashlight"
        ]
    },
    {
        "file": "plugins/cordova-plugin-spinner/www/spinner-plugin.js",
        "id": "cordova-plugin-spinner.SpinnerPlugin",
        "pluginId": "cordova-plugin-spinner",
        "clobbers": [
            "SpinnerPlugin"
        ]
    },
    {
        "file": "plugins/cordova-plugin-vibration/www/vibration.js",
        "id": "cordova-plugin-vibration.notification",
        "pluginId": "cordova-plugin-vibration",
        "merges": [
            "navigator.notification",
            "navigator"
        ]
    },
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    },
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
    "cordova-plugin-calendar": "4.4.7",
    "cordova-plugin-flashlight": "3.0.0",
    "cordova-plugin-spinner": "1.0.0",
    "cordova-plugin-vibration": "2.1.0",
    "cordova-plugin-whitelist": "1.2.1",
    "com.phonegap.plugins.Puship": "1.0.7",
    "cordova-plugin-geolocation": "2.2.0",
    "cordova-plugin-compat": "1.0.0"
}
// BOTTOM OF METADATA
});