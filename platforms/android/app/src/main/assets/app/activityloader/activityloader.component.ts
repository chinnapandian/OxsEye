import { Component } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";

@Component({
    selector: "modal-content",
    template: `
    <Page xmlns="http://schemas.nativescript.org/tns.xsd" (loaded)="pageLoaded($event)">
        <ActivityIndicator row="0" id="myIndicator" busy="true" backgroundColor="lightgray" borderRadius="50" color="blue"
			 width="50" height="50">
        </ActivityIndicator>
    </Page>
  `
})
export class ActivityLoader {
    constructor(private params: ModalDialogParams) {
       // this.imageSource = params.context.imageSource;
    }

    public close(result: string) {
        this.params.closeCallback(result);
    }
}