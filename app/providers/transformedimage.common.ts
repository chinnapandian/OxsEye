import { Injectable } from '@angular/core';

/**
 * TransformedImage injectable class
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
