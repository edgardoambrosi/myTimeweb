cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
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
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.1",
    "cordova-plugin-vibration": "2.1.0",
    "cordova-plugin-flashlight": "3.0.0",
    "cordova-plugin-spinner": "1.0.0"
}
// BOTTOM OF METADATA
});