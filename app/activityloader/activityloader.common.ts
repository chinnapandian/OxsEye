const LoadingIndicator = require('nativescript-loading-indicator').LoadingIndicator;
/**
 * Activity loader class.
 */
export class ActivityLoader {
    private _loader = new LoadingIndicator();

    // android and ios have some platform specific options
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
     * Show activity loader.
     */
    show() {
        try {
            this._loader.show(this.getOptions());
        } catch (e) {
            console.log('Error while showing lodingindicator. ' + e);
        }
    }
    /**
     * Hide activity loader.
     */
    hide() {
        this._loader.hide();
    }
}
