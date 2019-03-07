// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";

import { AppModule } from "./app.module";
import * as application from "tns-core-modules/application";
import * as traceModule from "tns-core-modules/trace"
const errorHandler: traceModule.ErrorHandler = {
    handlerError(err) {
        //option 1 (development) - throw the error
        // throw err;
        alert("error : " + err);
        //option 2 (development) - logging the error via write method provided from trace module
        traceModule.write(err, "unhandled-error", traceModule.messageType.error);

        //(production) - custom functionality for error handling
        //reportToAnalytics(err)
    }
}

traceModule.setErrorHandler(errorHandler)
// application.run({ moduleName: 'AppModule' });
application.on("discardedErrorEvent", function (args) {
    const error = args.error;
    alert(error);
    console.log("Received discarded exception: ");
    console.log(error.message);
    console.log(error.stackTrace);
    console.log(error.nativeException);
    //report the exception in your analytics solution here
});
platformNativeScriptDynamic().bootstrapModule(AppModule);
