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
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-calendar": "4.4.7",
    "cordova-plugin-flashlight": "3.0.0",
    "cordova-plugin-spinner": "1.0.0",
    "cordova-plugin-vibration": "2.1.0",
    "cordova-plugin-whitelist": "1.2.1"
}
// BOTTOM OF METADATA
});