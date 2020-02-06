"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
var oxseyelogger_1 = require("../logger/oxseyelogger");
// import { L } from 'nativescript-i18n/angular';
var nativescript_loading_indicator_1 = require("@nstudio/nativescript-loading-indicator");
var nativescript_localize_1 = require("nativescript-localize");
/**
 * Activity loader class to show up application event progress dialog box.
 */
var ActivityLoader = /** @class */ (function () {
    function ActivityLoader() {
        /** LoadingIndicator Instance variable. */
        this._loader = new nativescript_loading_indicator_1.LoadingIndicator();
        /** Logger variable to log message in different level */
        this.logger = new oxseyelogger_1.OxsEyeLogger();
    }
    /**Localization variable */
    // private locale = new L();
    /**
     * Gets LoadingIndicator options for both android and ios.
     * @returns options
     */
    ActivityLoader.prototype.getOptions = function () {
        var options = {
            message: nativescript_localize_1.localize('activity_loader_message'),
            progress: 0.65,
            margin: 10,
            dimBackground: true,
            color: '#4B9ED6',
            // background box around indicator
            // hideBezel will override this if true
            backgroundColor: 'yellow',
            userInteractionEnabled: false,
            hideBezel: true,
            mode: nativescript_loading_indicator_1.Mode.AnnularDeterminate,
            android: {
                //       view: android.view.View, // Target view to show on top of (Defaults to entire window)
                cancelable: true,
                cancelListener: function (dialog) {
                    console.log('Loading cancelled');
                }
            },
            ios: {
                //   view: someButton.ios, // Target view to show on top of (Defaults to entire window)
                square: false
            }
        };
        return options;
    };
    /**
     * Shows activity loader.
     */
    ActivityLoader.prototype.show = function () {
        try {
            this._loader.show(this.getOptions());
        }
        catch (error) {
            this.logger.error('Error while showing lodingindicator. ' + error);
        }
    };
    /**
     * Hides activity loader.
     */
    ActivityLoader.prototype.hide = function () {
        this._loader.hide();
    };
    return ActivityLoader;
}());
exports.ActivityLoader = ActivityLoader;
