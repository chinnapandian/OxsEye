import { Injectable } from '@angular/core';
import { File } from 'tns-core-modules/file-system';

import { OxsEyeLogger } from '../logger/oxseyelogger';
import { TransformedImage } from './transformedimage.common';

import * as application from 'tns-core-modules/application';

import * as Toast from 'nativescript-toast';

import * as Permissions from 'nativescript-permissions';

import * as frameModule from 'tns-core-modules/ui/frame';
import * as utilsModule from 'tns-core-modules/utils/utils';

/**
 * This is a provider class contains common functionalyties related to captured image.
 */
@Injectable()
export class TransformedImageProvider {
    /** Contains list of image */
    public imageList: any;
    /** Contains list of contour images captured while performing transformation.
     * Currently this is not been used.
     */
    public contourImageList: any;

    /**
     * Constructor for TransformedImageProvider
     */
    constructor(private logger: OxsEyeLogger) {
        this.imageList = [];
        this.contourImageList = [];
    }

    /**
     * Common method to share selected files via applicaple app like Gmail, whatsapp, etc..
     */
    share(dataToShare: any) {

        const activityController = UIActivityViewController.alloc()
            .initWithActivityItemsApplicationActivities([dataToShare], null);
        activityController.setValueForKey('Transformed Image(s)', 'Subject');
        const presentViewController = activityController.popoverPresentationController;
        if (presentViewController) {
            const page = frameModule.topmost().currentPage;
            if (page && page.ios.navigationItem.rightBarButtonItems &&
                page.ios.navigationItem.rightBarButtonItems.count > 0) {
                presentViewController.barButtonItem = page.ios.navigationItem.rightBarButtonItems[0];
            } else {
                presentViewController.sourceView = page.ios.view;
            }
        }

        utilsModule.ios.getter(UIApplication, UIApplication.sharedApplication)
            .keyWindow
            .rootViewController
            .presentViewControllerAnimatedCompletion(activityController, true, null);
    }

    /**
     * Deletes the selected image file from the disk.
     *
     * @param fileURI Image file path
     */
    deleteFile(fileURI: string) {
        const tempFile: File = File.fromPath(fileURI);
        tempFile.remove()
            .then(() => {
            }).catch((error) => {
                Toast.makeText('Error while deleting temporary files').show();
                this.logger.error('Error while deleting temporary files. ' + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
    /**
     * Renames the transformed image file name to given name. This is been used while performing
     * manual transformation using OpenCV API. As it creates temporary files behind the scene,
     * it needs to be renamed to refresh the final image in the view.
     *
     * @param fileURI Image file path
     * @param renameFileto Filename to be renamed to.
     */
    renameFile(fileURI: string, renameFileto: string) {
        const tempFile: File = File.fromPath(fileURI);
        tempFile.rename(renameFileto)
            .then(() => {
            }).catch((error) => {
                Toast.makeText('Error while renaming temporary file').show();
                this.logger.error('Error while renaming temporary files. ' + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
}
