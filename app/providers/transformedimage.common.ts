import { Injectable } from '@angular/core';

/**
 * This is an injectable class contains image information like transformed image URI,
 * original captured image path, thumbnail image path and isSelected indication to
 * say this image is been selected or not.
 */
@Injectable()
export class TransformedImage {
    /**
     * Constructor for TransformedImage.
     * @param fileName file name
     * @param filePath file URI path
     * @param thumbnailPath thumbnail file URI path
     * @param isSelected Contains boolean value to indicate the image is been selected or not
     */
    constructor(public fileName: string, public filePath: string, public thumbnailPath: string, public isSelected: boolean) { }
}
