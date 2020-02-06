import { Component } from '@angular/core';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
import {Pager} from 'nativescript-pager';
import {PhotoZoom} from 'nativescript-photo-zoom';

import { registerElement } from 'nativescript-angular/element-registry';
registerElement('CameraPlus', () => CameraPlus as any);
registerElement('CheckBox', () => require('@nstudio/nativescript-checkbox').CheckBox);
registerElement('ImageSwipe', () => require('nativescript-image-swipe/image-swipe').ImageSwipe);
registerElement('Pager', () => Pager as any);
registerElement('PhotoZoom', () => PhotoZoom as any);

registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);
/** Application startup component */
@Component({
    selector: 'ns-app',
    templateUrl: './app.component.html',
})
export class AppComponent { }
