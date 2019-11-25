//@ts-ignore
import { OxsEyeLogger } from '../logger/oxseyelogger';

// import { L } from 'nativescript-i18n/angular';

import { LoadingIndicator, Mode, OptionsCommon } from '@nstudio/nativescript-loading-indicator';
import { localize } from "nativescript-localize";
declare var android:any;

/**
 * LoadingIndicator Instance variable.
 */
// const LoadingIndicator = require('nativescript-loading-indicator').LoadingIndicator;

/**
 * Activity loader class to show up application event progress dialog box.
 */
export class ActivityLoader {
    /** LoadingIndicator Instance variable. */
    private _loader = new LoadingIndicator();
    /** Logger variable to log message in different level */
    private logger = new OxsEyeLogger();

    /**Localization variable */
    // private locale = new L();

    /**
     * Gets LoadingIndicator options for both android and ios.
     * @returns options
     */
    private getOptions(): any {
        const options = {
            message: localize('activity_loader_message'), //this.locale.transform('activity_loader_message'),
            progress: 0.65,
            margin: 10,
            dimBackground: true,
            color: '#4B9ED6', // color of indicator and labels
            // background box around indicator
            // hideBezel will override this if true
            backgroundColor: 'yellow',
            userInteractionEnabled: false, // default true. Set false so that the touches will fall through it.
            hideBezel: true, // default false, can hide the surrounding bezel
            mode: Mode.AnnularDeterminate, // see options below
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
    }
    /**
     * Shows activity loader.
     */
    show() {
        try {
            this._loader.show(this.getOptions());
        } catch (error) {
            this.logger.error('Error while showing lodingindicator. ' + error);
        }
    }
    /**
     * Hides activity loader.
     */
    hide() {
        this._loader.hide();
    }
}
