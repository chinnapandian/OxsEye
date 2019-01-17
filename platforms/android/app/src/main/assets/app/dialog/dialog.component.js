"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var orientation = require('nativescript-orientation');
var imgView;
var prevDeltaX;
var prevDeltaY;
var startScale = 1;
var DialogContent = (function () {
    function DialogContent(params) {
        this.params = params;
        //        this.imageSource = params.context.imageSource;
    }
    DialogContent.prototype.close = function (result) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    };
    DialogContent.prototype.onPinch = function (args) {
        if (args.state === 1) {
            var newOriginX = args.getFocusX() - imgView.translateX;
            var newOriginY = args.getFocusY() - imgView.translateY;
            var oldOriginX = imgView.originX * imgView.getMeasuredWidth();
            var oldOriginY = imgView.originY * imgView.getMeasuredHeight();
            imgView.translateX += (oldOriginX - newOriginX) * (1 - imgView.scaleX);
            imgView.translateY += (oldOriginY - newOriginY) * (1 - imgView.scaleY);
            imgView.originX = newOriginX / imgView.getMeasuredWidth();
            imgView.originY = newOriginY / imgView.getMeasuredHeight();
            startScale = imgView.scaleX;
        }
        else if (args.scale && args.scale !== 1) {
            var newScale = startScale * args.scale;
            newScale = Math.min(8, newScale);
            newScale = Math.max(0.125, newScale);
            imgView.scaleX = newScale;
            imgView.scaleY = newScale;
        }
    };
    DialogContent.prototype.onPan = function (args) {
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
    };
    DialogContent.prototype.onDoubleTap = function (args) {
        imgView.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: "easeOut",
            duration: 300
        }).then(function () {
            //    updateStatus();
        });
    };
    DialogContent.prototype.pageLoaded = function (args) {
        this.imageSource = this.params.context.imageSource;
        var page = args.object;
        imgView = page.getViewById("imgViewId");
        imgView.translateX = 0;
        imgView.translateY = 0;
        imgView.scaleX = 1;
        imgView.scaleY = 1;
        //orientation.disableRotation();
        orientation.setOrientation("portrait");
    };
    return DialogContent;
}());
DialogContent = __decorate([
    core_1.Component({
        selector: "modal-content",
        template: "\n    <Page xmlns=\"http://schemas.nativescript.org/tns.xsd\" (loaded)=\"pageLoaded($event)\">\n    <StackLayout backgroundColor=\"lightgray\"  orientation=\"vertical\" margin=\"20\" horizontalAlignment=\"center\" verticalAlignment=\"center\">\n         <GridLayout rows=\"*\" height=\"90%\" (pan)=\"onPan($event)\" (pinch)=\"onPinch($event)\" (doubleTap)=\"onDoubleTap($event)\" borderLeftWidth=\"1\" borderBottomWidth=\"1\" borderRightWidth=\"1\" borderTopWidth=\"1\"  horizontalAlignment=\"center\" verticalAlignment=\"center\">\n            <Image row=\"0\" src=\"{{ imageSource }}\" stretch=\"aspectFit\" id=\"imgViewId\" backgroundColor=\"Green\"></Image>          </GridLayout>\n            <StackLayout  height=\"10%\" orientation=\"horizontal\" horizontalAlignment=\"center\" verticalAlignment=\"center\" marginTop=\"10\">\n            <Button class=\"btn btn-outline btn-active btn-rounded-lg\" text=\"Retake\" (tap)=\"close('')\"></Button>\n            <Button class=\"btn btn-outline btn-active btn-rounded-lg\" text=\"Save\" (tap)=\"close(imageSource)\"></Button>\n        </StackLayout>\n    </StackLayout>\n    </Page>\n  "
    }),
    __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams])
], DialogContent);
exports.DialogContent = DialogContent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBeUM7QUFDekMsa0VBQXNFO0FBSXRFLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBRXRELElBQUksT0FBYSxDQUFDO0FBQ2xCLElBQUksVUFBa0IsQ0FBQztBQUN2QixJQUFJLFVBQWtCLENBQUM7QUFDdkIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBaUJuQixJQUFhLGFBQWE7SUFFdEIsdUJBQW9CLE1BQXlCO1FBQXpCLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBQ3pDLHdEQUF3RDtJQUM1RCxDQUFDO0lBRU0sNkJBQUssR0FBWixVQUFhLE1BQWM7UUFDdEIsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCwrQkFBTyxHQUFQLFVBQVEsSUFBMkI7UUFDL0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ3pELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBRXpELElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDaEUsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUVqRSxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxHQUFHLFVB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LEFBeEVELElBd0VDO0FBeEVZLGFBQWE7SUFmekIsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRSxtbkNBV1g7S0FDRixDQUFDO3FDQUc4QixnQ0FBaUI7R0FGcEMsYUFBYSxDQXdFekI7QUF4RVksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnR9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ1BhcmFtcyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2dcIjtcbmltcG9ydCB7IFZpZXcgfSBmcm9tIFwidWkvY29yZS92aWV3XCI7XG5pbXBvcnQgeyBHZXN0dXJlRXZlbnREYXRhLCBQYW5HZXN0dXJlRXZlbnREYXRhLCBQaW5jaEdlc3R1cmVFdmVudERhdGEgfSBmcm9tIFwidWkvZ2VzdHVyZXNcIjtcbmltcG9ydCB7IFN3aXBlR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2dlc3R1cmVzXCI7XG52YXIgb3JpZW50YXRpb24gPSByZXF1aXJlKCduYXRpdmVzY3JpcHQtb3JpZW50YXRpb24nKTtcblxubGV0IGltZ1ZpZXc6IFZpZXc7XG5sZXQgcHJldkRlbHRhWDogbnVtYmVyO1xubGV0IHByZXZEZWx0YVk6IG51bWJlcjtcbmxldCBzdGFydFNjYWxlID0gMTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6IFwibW9kYWwtY29udGVudFwiLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgPFBhZ2UgeG1sbnM9XCJodHRwOi8vc2NoZW1hcy5uYXRpdmVzY3JpcHQub3JnL3Rucy54c2RcIiAobG9hZGVkKT1cInBhZ2VMb2FkZWQoJGV2ZW50KVwiPlxuICAgIDxTdGFja0xheW91dCBiYWNrZ3JvdW5kQ29sb3I9XCJsaWdodGdyYXlcIiAgb3JpZW50YXRpb249XCJ2ZXJ0aWNhbFwiIG1hcmdpbj1cIjIwXCIgaG9yaXpvbnRhbEFsaWdubWVudD1cImNlbnRlclwiIHZlcnRpY2FsQWxpZ25tZW50PVwiY2VudGVyXCI+XG4gICAgICAgICA8R3JpZExheW91dCByb3dzPVwiKlwiIGhlaWdodD1cIjkwJVwiIChwYW4pPVwib25QYW4oJGV2ZW50KVwiIChwaW5jaCk9XCJvblBpbmNoKCRldmVudClcIiAoZG91YmxlVGFwKT1cIm9uRG91YmxlVGFwKCRldmVudClcIiBib3JkZXJMZWZ0V2lkdGg9XCIxXCIgYm9yZGVyQm90dG9tV2lkdGg9XCIxXCIgYm9yZGVyUmlnaHRXaWR0aD1cIjFcIiBib3JkZXJUb3BXaWR0aD1cIjFcIiAgaG9yaXpvbnRhbEFsaWdubWVudD1cImNlbnRlclwiIHZlcnRpY2FsQWxpZ25tZW50PVwiY2VudGVyXCI+XG4gICAgICAgICAgICA8SW1hZ2Ugcm93PVwiMFwiIHNyYz1cInt7IGltYWdlU291cmNlIH19XCIgc3RyZXRjaD1cImFzcGVjdEZpdFwiIGlkPVwiaW1nVmlld0lkXCIgYmFja2dyb3VuZENvbG9yPVwiR3JlZW5cIj48L0ltYWdlPiAgICAgICAgICA8L0dyaWRMYXlvdXQ+XG4gICAgICAgICAgICA8U3RhY2tMYXlvdXQgIGhlaWdodD1cIjEwJVwiIG9yaWVudGF0aW9uPVwiaG9yaXpvbnRhbFwiIGhvcml6b250YWxBbGlnbm1lbnQ9XCJjZW50ZXJcIiB2ZXJ0aWNhbEFsaWdubWVudD1cImNlbnRlclwiIG1hcmdpblRvcD1cIjEwXCI+XG4gICAgICAgICAgICA8QnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1vdXRsaW5lIGJ0bi1hY3RpdmUgYnRuLXJvdW5kZWQtbGdcIiB0ZXh0PVwiUmV0YWtlXCIgKHRhcCk9XCJjbG9zZSgnJylcIj48L0J1dHRvbj5cbiAgICAgICAgICAgIDxCdXR0b24gY2xhc3M9XCJidG4gYnRuLW91dGxpbmUgYnRuLWFjdGl2ZSBidG4tcm91bmRlZC1sZ1wiIHRleHQ9XCJTYXZlXCIgKHRhcCk9XCJjbG9zZShpbWFnZVNvdXJjZSlcIj48L0J1dHRvbj5cbiAgICAgICAgPC9TdGFja0xheW91dD5cbiAgICA8L1N0YWNrTGF5b3V0PlxuICAgIDwvUGFnZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dDb250ZW50ICB7XG4gICAgcHVibGljIGltYWdlU291cmNlOiBhbnk7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJhbXM6IE1vZGFsRGlhbG9nUGFyYW1zKSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLmltYWdlU291cmNlID0gcGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNsb3NlKHJlc3VsdDogc3RyaW5nKSB7XG4gICAgICAgICBvcmllbnRhdGlvbi5lbmFibGVSb3RhdGlvbigpO1xuICAgICAgICB0aGlzLnBhcmFtcy5jbG9zZUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09yaWdpblggPSBhcmdzLmdldEZvY3VzWCgpIC0gaW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgY29uc3QgbmV3T3JpZ2luWSA9IGFyZ3MuZ2V0Rm9jdXNZKCkgLSBpbWdWaWV3LnRyYW5zbGF0ZVk7XG5cbiAgICAgICAgICAgIGNvbnN0IG9sZE9yaWdpblggPSBpbWdWaWV3Lm9yaWdpblggKiBpbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKTtcbiAgICAgICAgICAgIGNvbnN0IG9sZE9yaWdpblkgPSBpbWdWaWV3Lm9yaWdpblkgKiBpbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIGltZ1ZpZXcudHJhbnNsYXRlWCArPSAob2xkT3JpZ2luWCAtIG5ld09yaWdpblgpICogKDEgLSBpbWdWaWV3LnNjYWxlWCk7XG4gICAgICAgICAgICBpbWdWaWV3LnRyYW5zbGF0ZVkgKz0gKG9sZE9yaWdpblkgLSBuZXdPcmlnaW5ZKSAqICgxIC0gaW1nVmlldy5zY2FsZVkpO1xuXG4gICAgICAgICAgICBpbWdWaWV3Lm9yaWdpblggPSBuZXdPcmlnaW5YIC8gaW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCk7XG4gICAgICAgICAgICBpbWdWaWV3Lm9yaWdpblkgPSBuZXdPcmlnaW5ZIC8gaW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpO1xuXG4gICAgICAgICAgICBzdGFydFNjYWxlID0gaW1nVmlldy5zY2FsZVg7XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgIGxldCBuZXdTY2FsZSA9IHN0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgICAgICAgICAgbmV3U2NhbGUgPSBNYXRoLm1pbig4LCBuZXdTY2FsZSk7XG4gICAgICAgICAgICBuZXdTY2FsZSA9IE1hdGgubWF4KDAuMTI1LCBuZXdTY2FsZSk7XG5cbiAgICAgICAgICAgIGltZ1ZpZXcuc2NhbGVYID0gbmV3U2NhbGU7XG4gICAgICAgICAgICBpbWdWaWV3LnNjYWxlWSA9IG5ld1NjYWxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uUGFuKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgcHJldkRlbHRhWSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgaW1nVmlldy50cmFuc2xhdGVYICs9IGFyZ3MuZGVsdGFYIC0gcHJldkRlbHRhWDtcbiAgICAgICAgICAgIGltZ1ZpZXcudHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHByZXZEZWx0YVk7XG5cbiAgICAgICAgICAgIHByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgIHByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvbkRvdWJsZVRhcChhcmdzOiBHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGltZ1ZpZXcuYW5pbWF0ZSh7XG4gICAgICAgICAgICB0cmFuc2xhdGU6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgc2NhbGU6IHsgeDogMSwgeTogMSB9LFxuICAgICAgICAgICAgY3VydmU6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgZHVyYXRpb246IDMwMFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgIHVwZGF0ZVN0YXR1cygpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGFnZUxvYWRlZChhcmdzKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlO1xuICAgICAgICBjb25zdCBwYWdlID0gYXJncy5vYmplY3Q7XG4gICAgICAgIGltZ1ZpZXcgPSBwYWdlLmdldFZpZXdCeUlkKFwiaW1nVmlld0lkXCIpO1xuXG4gICAgICAgIGltZ1ZpZXcudHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIGltZ1ZpZXcudHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIGltZ1ZpZXcuc2NhbGVYID0gMTtcbiAgICAgICAgaW1nVmlldy5zY2FsZVkgPSAxO1xuICAgICAgICAvL29yaWVudGF0aW9uLmRpc2FibGVSb3RhdGlvbigpO1xuICAgICAgICBvcmllbnRhdGlvbi5zZXRPcmllbnRhdGlvbihcInBvcnRyYWl0XCIpO1xuICAgIH1cbn0iXX0=