import { Component } from '@angular/core';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
import { registerElement } from 'nativescript-angular/element-registry';
registerElement('CameraPlus', () => <any>CameraPlus);
registerElement('CheckBox', () => require('nativescript-checkbox').CheckBox);
registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);

@Component({
  selector: 'ns-app',
  templateUrl: 'app.component.html'
})
export class AppComponent {}
