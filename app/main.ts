// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from 'nativescript-angular/platform';

// import * as application from 'tns-core-modules/application';
// import * as traceModule from 'tns-core-modules/trace';
import { AppModule } from './app.module';

/** This is main bootstrap module for this application. */
platformNativeScriptDynamic().bootstrapModule(AppModule);
