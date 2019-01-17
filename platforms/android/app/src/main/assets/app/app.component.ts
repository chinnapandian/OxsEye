import { Component } from "@angular/core";
import { CameraPlus } from "@nstudio/nativescript-camera-plus";
import { registerElement } from "nativescript-angular/element-registry";
//import { Repeater } from "tns-core-modules/ui/repeater";
// import { BottomBar, BottomBarItem, TITLE_STATE, SelectedIndexChangedEventData, Notification } from 'nativescript-bottombar';
// registerElement('BottomBar', () => BottomBar);
registerElement("CameraPlus", () => <any>CameraPlus);
//registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);
//registerElement("Repeater", () => <any>Repeater);
registerElement('CheckBox', () => require('nativescript-checkbox').CheckBox);

@Component({
  selector: "ns-app",
  templateUrl: "app.component.html"
})
export class AppComponent {}
