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
var ActivityLoader = (function () {
    function ActivityLoader(params) {
        this.params = params;
        // this.imageSource = params.context.imageSource;
    }
    ActivityLoader.prototype.close = function (result) {
        this.params.closeCallback(result);
    };
    return ActivityLoader;
}());
ActivityLoader = __decorate([
    core_1.Component({
        selector: "modal-content",
        template: "\n    <Page xmlns=\"http://schemas.nativescript.org/tns.xsd\" (loaded)=\"pageLoaded($event)\">\n        <ActivityIndicator row=\"0\" id=\"myIndicator\" busy=\"true\" backgroundColor=\"lightgray\" borderRadius=\"50\" color=\"blue\"\n\t\t\t width=\"50\" height=\"50\">\n        </ActivityIndicator>\n    </Page>\n  "
    }),
    __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams])
], ActivityLoader);
exports.ActivityLoader = ActivityLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlsb2FkZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWN0aXZpdHlsb2FkZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTBDO0FBQzFDLGtFQUFzRTtBQVl0RSxJQUFhLGNBQWM7SUFDdkIsd0JBQW9CLE1BQXlCO1FBQXpCLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBQzFDLGlEQUFpRDtJQUNwRCxDQUFDO0lBRU0sOEJBQUssR0FBWixVQUFhLE1BQWM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFSWSxjQUFjO0lBVjFCLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsZUFBZTtRQUN6QixRQUFRLEVBQUUsMlRBTVg7S0FDRixDQUFDO3FDQUU4QixnQ0FBaUI7R0FEcEMsY0FBYyxDQVExQjtBQVJZLHdDQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE1vZGFsRGlhbG9nUGFyYW1zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZ1wiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogXCJtb2RhbC1jb250ZW50XCIsXG4gICAgdGVtcGxhdGU6IGBcbiAgICA8UGFnZSB4bWxucz1cImh0dHA6Ly9zY2hlbWFzLm5hdGl2ZXNjcmlwdC5vcmcvdG5zLnhzZFwiIChsb2FkZWQpPVwicGFnZUxvYWRlZCgkZXZlbnQpXCI+XG4gICAgICAgIDxBY3Rpdml0eUluZGljYXRvciByb3c9XCIwXCIgaWQ9XCJteUluZGljYXRvclwiIGJ1c3k9XCJ0cnVlXCIgYmFja2dyb3VuZENvbG9yPVwibGlnaHRncmF5XCIgYm9yZGVyUmFkaXVzPVwiNTBcIiBjb2xvcj1cImJsdWVcIlxuXHRcdFx0IHdpZHRoPVwiNTBcIiBoZWlnaHQ9XCI1MFwiPlxuICAgICAgICA8L0FjdGl2aXR5SW5kaWNhdG9yPlxuICAgIDwvUGFnZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBY3Rpdml0eUxvYWRlciB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJhbXM6IE1vZGFsRGlhbG9nUGFyYW1zKSB7XG4gICAgICAgLy8gdGhpcy5pbWFnZVNvdXJjZSA9IHBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbG9zZShyZXN1bHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnBhcmFtcy5jbG9zZUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxufSJdfQ==