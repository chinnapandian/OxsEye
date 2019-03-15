import { Injectable } from '@angular/core';

/**
 * TransformedImage class
 */
@Injectable()
export class TransformedImage {
    /**
     * Constructor for TransformedImage.
     * @param fileName 
     * @param filePath 
     * @param thumbnailPath 
     * @param isSelected 
     */
    constructor(public fileName: string, public filePath: string, public thumbnailPath: string, public isSelected: boolean) { }
}
