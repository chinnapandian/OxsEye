import { OxsEyeLogger } from '../logger/oxseyelogger';
/**
 * LoadingIndicator Instance variable.
 */
const LoadingIndicator = require('nativescript-loading-indicator').LoadingIndicator;

/**
 * Activity loader class to show up application event progress dialog box.
 */
export class ActivityLoader {
    /** LoadingIndicator Instance variable. */
    private _loader = new LoadingIndicator();

    /** constructor for ActivityLoader */
    constructor(private logger: OxsEyeLogger) {
    }

    /**
     * Gets LoadingIndicator options for both android and ios.
     * @returns options
     */
    private getOptions(): any {
        const options = {
            message: 'Loading...',
            progress: 0.65,
            android: {
                indeterminate: true,
                cancelable: true,
                cancelListener(dialog) { console.log('Loading cancelled'); },
                max: 100,
                progressNumberFormat: '%1d/%2d',
                progressPercentFormat: 0.53,
                progressStyle: 1,
                secondaryProgress: 1,
            },
            ios: {
                details: 'Additional detail note!',
                margin: 10,
                dimBackground: true,
                color: '#4B9ED6', // color of indicator and labels
                // background box around indicator
                // hideBezel will override this if true
                backgroundColor: 'yellow',
                hideBezel: true, // default false, can hide the surrounding bezel
                // view: UIView // Target view to show on top of (Defaults to entire window)
                //  mode: // see iOS specific options below
            },
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
