import { Component } from '@angular/core';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
// import { CameraPlus } from 'nativescript-opencv-camera-plus';
import { registerElement } from 'nativescript-angular/element-registry';
// import { NativeScriptI18nModule, L } from "nativescript-i18n/angular";
// registerElement('L', () => L as any);
registerElement('CameraPlus', () => CameraPlus as any);
registerElement('CheckBox', () => require('nativescript-checkbox').CheckBox);
registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);
/**
 * This is the application component layout
 * where all other component(s) will be used.
 */
@Component({
  selector: 'ns-app',
  templateUrl: 'app.component.html',
})
export class AppComponent { }
