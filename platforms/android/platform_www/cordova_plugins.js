cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "com.phonegap.plugins.Puship.PushNotification",
        "file": "plugins/com.phonegap.plugins.Puship/www/PushNotification.js",
        "pluginId": "com.phonegap.plugins.Puship",
        "clobbers": [
            "PushNotification"
        ]
    },
    {
        "id": "com.phonegap.plugins.Puship.PushipNotification",
        "file": "plugins/com.phonegap.plugins.Puship/www/PushipNotification.js",
        "pluginId": "com.phonegap.plugins.Puship",
        "clobbers": [
            "PushipNotification"
        ]
    },
    {
        "id": "cordova-plugin-calendar.Calendar",
        "file": "plugins/cordova-plugin-calendar/www/Calendar.js",
        "pluginId": "cordova-plugin-calendar",
        "clobbers": [
            "Calendar"
        ]
    },
    {
        "id": "cordova-plugin-calendar.tests",
        "file": "plugins/cordova-plugin-calendar/test/tests.js",
        "pluginId": "cordova-plugin-calendar"
    },
    {
        "id": "cordova-plugin-dialogs.notification",
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "id": "cordova-plugin-dialogs.notification_android",
        "file": "plugins/cordova-plugin-dialogs/www/android/notification.js",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "id": "cordova-plugin-flashlight.Flashlight",
        "file": "plugins/cordova-plugin-flashlight/www/Flashlight.js",
        "pluginId": "cordova-plugin-flashlight",
        "clobbers": [
            "window.plugins.flashlight"
        ]
    },
    {
        "id": "cordova-plugin-geolocation.geolocation",
        "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
        "pluginId": "cordova-plugin-geolocation",
        "clobbers": [
            "navigator.geolocation"
        ]
    },
    {
        "id": "cordova-plugin-geolocation.PositionError",
        "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
        "pluginId": "cordova-plugin-geolocation",
        "runs": true
    },
    {
        "id": "cordova-plugin-spinner.SpinnerPlugin",
        "file": "plugins/cordova-plugin-spinner/www/spinner-plugin.js",
        "pluginId": "cordova-plugin-spinner",
        "clobbers": [
            "SpinnerPlugin"
        ]
    },
    {
        "id": "cordova-plugin-vibration.notification",
        "file": "plugins/cordova-plugin-vibration/www/vibration.js",
        "pluginId": "cordova-plugin-vibration",
        "merges": [
            "navigator.notification",
            "navigator"
        ]
    },
    {
        "id": "cordova-plugin-whitelist.whitelist",
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.phonegap.plugins.Puship": "1.0.7",
    "cordova-plugin-calendar": "4.4.7",
    "cordova-plugin-compat": "1.0.0",
    "cordova-plugin-dialogs": "1.3.3",
    "cordova-plugin-flashlight": "3.2.0",
    "cordova-plugin-geolocation": "2.2.0",
    "cordova-plugin-spinner": "1.0.0",
    "cordova-plugin-vibration": "2.1.0",
    "cordova-plugin-whitelist": "1.2.1"
};
// BOTTOM OF METADATA
});