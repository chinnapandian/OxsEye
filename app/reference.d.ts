/// <reference path='./node_modules/tns-platform-declarations/ios.d.ts' />
/// <reference path='./node_modules/tns-platform-declarations/android.d.ts' />
/// <reference path="./node_modules/nativescript-i18n/references.d.ts" />

declare module 'nativescript-opencv-plugin';
declare module 'dialog' {
    import dialog1 from '../dialog/dialog.component';
    export default dialog1;
}
