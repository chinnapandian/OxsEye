//
//  OpenCVWrapper.h
//  HelloOpenCViOS_2
//
//  Created by chinnamaruthu pandian on 20/05/19.
//  Copyright © 2019 chinnamaruthu pandian. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface OpenCVWrapper : NSObject
+ (NSString *)openCVVersionString;
+ (NSString *)performTransformation:(NSString*)filePath;
+ (NSString *) performPerspectiveCorrectionManual:(NSString*)imgURI :(NSString*)rectanglePointsStr :(NSString*)imageActualSize;
+ (NSString *) createThumbnailImage:(NSString*)tranformedImageURI;
@end
