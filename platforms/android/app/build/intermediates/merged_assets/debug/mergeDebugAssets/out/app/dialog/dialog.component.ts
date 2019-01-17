import { Component} from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { View } from "ui/core/view";
import { GestureEventData, PanGestureEventData, PinchGestureEventData } from "ui/gestures";
import { SwipeGestureEventData } from "tns-core-modules/ui/gestures";
var orientation = require('nativescript-orientation');

let imgView: View;
let prevDeltaX: number;
let prevDeltaY: number;
let startScale = 1;

@Component({
    selector: "modal-content",
    template: `
    <Page xmlns="http://schemas.nativescript.org/tns.xsd" (loaded)="pageLoaded($event)">
    <StackLayout backgroundColor="lightgray"  orientation="vertical" margin="20" horizontalAlignment="center" verticalAlignment="center">
         <GridLayout rows="*" height="90%" (pan)="onPan($event)" (pinch)="onPinch($event)" (doubleTap)="onDoubleTap($event)" borderLeftWidth="1" borderBottomWidth="1" borderRightWidth="1" borderTopWidth="1"  horizontalAlignment="center" verticalAlignment="center">
            <Image row="0" src="{{ imageSource }}" stretch="aspectFit" id="imgViewId" backgroundColor="Green"></Image>          </GridLayout>
            <StackLayout  height="10%" orientation="horizontal" horizontalAlignment="center" verticalAlignment="center" marginTop="10">
            <Button class="btn btn-outline btn-active btn-rounded-lg" text="Retake" (tap)="close('')"></Button>
            <Button class="btn btn-outline btn-active btn-rounded-lg" text="Save" (tap)="close(imageSource)"></Button>
        </StackLayout>
    </StackLayout>
    </Page>
  `
})
export class DialogContent  {
    public imageSource: any;
    constructor(private params: ModalDialogParams) {
        //        this.imageSource = params.context.imageSource;
    }

    public close(result: string) {
         orientation.enableRotation();
        this.params.closeCallback(result);
    }

    onPinch(args: PinchGestureEventData) {
        if (args.state === 1) {
            const newOriginX = args.getFocusX() - imgView.translateX;
            const newOriginY = args.getFocusY() - imgView.translateY;

            const oldOriginX = imgView.originX * imgView.getMeasuredWidth();
            const oldOriginY = imgView.originY * imgView.getMeasuredHeight();

            imgView.translateX += (oldOriginX - newOriginX) * (1 - imgView.scaleX);
            imgView.translateY += (oldOriginY - newOriginY) * (1 - imgView.scaleY);

            imgView.originX = newOriginX / imgView.getMeasuredWidth();
            imgView.originY = newOriginY / imgView.getMeasuredHeight();

            startScale = imgView.scaleX;
        }

        else if (args.scale && args.scale !== 1) {
            let newScale = startScale * args.scale;
            newScale = Math.min(8, newScale);
            newScale = Math.max(0.125, newScale);

            imgView.scaleX = newScale;
            imgView.scaleY = newScale;
        }
    }
    onPan(args: PanGestureEventData) {
        if (args.state === 1) {
            prevDeltaX = 0;
            prevDeltaY = 0;
        }
        else if (args.state === 2) {
            imgView.translateX += args.deltaX - prevDeltaX;
            imgView.translateY += args.deltaY - prevDeltaY;

            prevDeltaX = args.deltaX;
            prevDeltaY = args.deltaY;
        }
    }
    onDoubleTap(args: GestureEventData) {
        imgView.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: "easeOut",
            duration: 300
        }).then(function () {
            //    updateStatus();
        });
    }
    pageLoaded(args) {
        this.imageSource = this.params.context.imageSource;
        const page = args.object;
        imgView = page.getViewById("imgViewId");

        imgView.translateX = 0;
        imgView.translateY = 0;
        imgView.scaleX = 1;
        imgView.scaleY = 1;
        //orientation.disableRotation();
        orientation.setOrientation("portrait");
    }
}