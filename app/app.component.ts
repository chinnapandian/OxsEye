import { Component } from "@angular/core";
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
// import { CameraPlus } from 'nativescript-opencv-camera-plus';
import { registerElement } from 'nativescript-angular/element-registry';
// import { NativeScriptI18nModule, L } from "nativescript-i18n/angular";
// registerElement('L', () => L as any);
registerElement('CameraPlus', () => CameraPlus as any);
registerElement('CheckBox', () => require('@nstudio/nativescript-checkbox').CheckBox);
registerElement("ImageSwipe", () => require("nativescript-image-swipe/image-swipe").ImageSwipe);

@Component({
    selector: "ns-app",
    templateUrl: "./app.component.html"
})
export class AppComponent { }
