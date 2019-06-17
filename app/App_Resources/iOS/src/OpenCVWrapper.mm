//
//  OpenCVWrapper.m
//  HelloOpenCViOS_2
//
//  Created by chinnamaruthu pandian on 20/05/19.
//  Copyright © 2019 chinnamaruthu pandian. All rights reserved.
//

#include <opencv2/opencv.hpp>
#import "UIKit/UIKit.h"
#import "OpenCVWrapper.h"
using namespace std;

@implementation OpenCVWrapper

+ (NSString *)openCVVersionString {

    return [NSString stringWithFormat:@"OpenCV Version %s",  CV_VERSION];
}
/**
   Performs perspective transformation for the given captured image.
 Which loads the captured image, convert into gray color image, then doing adaptive thresholding and
 find contours with square. Then transform the image based on the square it got from contours and then
 does the adaptive thresholding for the trnsformed image.
 @param filePathStr it is a captured image file path
 @return NSString Returns transformed image with adaptive thresholding
 */
+ (NSString *) performTransformation:(NSString*)filePathStr {
    
    string filePath = string([filePathStr UTF8String]);
    cv::Mat src;
    cv::Mat gray;
    
    src = cv::imread(filePath, CV_LOAD_IMAGE_COLOR);
    cvtColor(src, gray, CV_BGR2GRAY);
    cv::medianBlur(gray, gray, 91);

    int srcArea = src.rows * src.cols;
//    bool rectangleFound = false;
    cv::Mat *quadFound = NULL;
    string filePathPng = "";
//    string jpg = ".jpg";
//    string filePathPng = filePath;
//    filePathPng.replace(filePathPng.find(jpg), jpg.size(), ".png");
    
    cv::Mat gray0;
    int blockSize[] = {33, 35, 37, 39, 41, 43, 45}; // multiple blocksize for threshold
    for ( int j=0 ; j<7 ; j++ )
    {
        cv::adaptiveThreshold(gray, gray0, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C,
                              cv::THRESH_BINARY_INV, blockSize[j], 9);

        int largest_area=0;
        int largest_contour_index=0;
        cv::Rect bounding_rect;
        vector<vector<cv::Point>> contours; // Vector for storing contour
        vector<cv::Vec4i> hierarchy;
        findContours( gray0, contours, hierarchy,CV_RETR_CCOMP, CV_CHAIN_APPROX_SIMPLE );
        
    //     iterate through each contour.
        for( int i = 0; i< contours.size(); i++ )
        {
            //  Find the area of contour
            double areaOfContour=cv::contourArea( contours[i],false);
            if(areaOfContour>largest_area
               && areaOfContour < srcArea * 0.85){
                largest_area=areaOfContour;
                // Store the index of largest contour
                largest_contour_index=i;
            }
        }
        
        // create hull array for convex hull points
        vector< vector<cv::Point> > hull(contours.size());
        convexHull(cv::Mat(contours[largest_contour_index]), hull[largest_contour_index], false);

        // Determine approximation contour to get squares
        cv::Mat* approx = new cv::Mat();
        vector<cv::Point2f> source_pts;
        double arcLen = arcLength(contours[largest_contour_index], true) * 0.02;
        approxPolyDP(hull[largest_contour_index], *approx, arcLen, true);
        if(approx->rows == 4) {
            vector<cv::Point2f> corners;
            approx->convertTo(corners, CV_32F);
            for (int j = 0; j < 4; j++) {
                source_pts.push_back(corners[j]);
            }
        }
        if(source_pts.size() == 4) {
            filePathPng = performPerspectiveTransformation(filePath, src, source_pts );
//            cv::Mat quad = cv::Mat::zeros(norm(source_pts[3] - source_pts[0]), norm(source_pts[0] - source_pts[1]), src.type()); // rows,cols
//
//            vector<cv::Point2f> quad_pts;
//            quad_pts.push_back(cv::Point2f(quad.cols, quad.rows));
//            quad_pts.push_back(cv::Point2f(0, quad.rows));
//            quad_pts.push_back(cv::Point2f(0, 0));
//            quad_pts.push_back(cv::Point2f(quad.cols, 0));
//
//            // Perform transformation
//            cv::Mat transmtx = cv::getPerspectiveTransform(source_pts, quad_pts);
//            cv::warpPerspective(src, quad, transmtx, quad.size());
//
            cv::Mat thresholdImg = *new cv::Mat();
//            cvtColor(quad, thresholdImg, CV_BGR2GRAY);
//            adaptiveThreshold(thresholdImg, thresholdImg, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C, cv::THRESH_BINARY, 41, 9);
//            vector<int> compression_params;
//            compression_params.push_back(CV_IMWRITE_PNG_COMPRESSION);
//            compression_params.push_back(9);
//            cv::imwrite(filePathPng, thresholdImg, compression_params);
            quadFound = &thresholdImg;
            string sourcePointsStr = getRectanglePointsInString(source_pts, src.cols,src.rows);
            return convertString2NSString(filePathPng + sourcePointsStr);
        }
    
    }
    //If no rectangle found, write the captured image.
    if(quadFound == NULL) {
        cv::Mat thresholdImg = *new cv::Mat();
        cvtColor(src, thresholdImg, CV_BGR2GRAY);
        adaptiveThreshold(thresholdImg, thresholdImg, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C, cv::THRESH_BINARY, 41, 9);
        string fileName = getFileName(filePath);
        string imgFolderPath = filePath.substr(0,filePath.find_last_of("/")+1);
        filePathPng = imgFolderPath + fileName + "_transformed.png";
        cv::imwrite(filePathPng, thresholdImg);
    }
    return convertString2NSString(filePathPng + "RPTSTR#");
}

+ (NSString *) performPerspectiveCorrectionManual:(NSString*)imgURI :(NSString*)rectanglePointsStr :(NSString*)imageActualSize {
    string imgURI0 = string([imgURI UTF8String]);
    string rectanglePointsStr0 = string([rectanglePointsStr UTF8String]);
    string imageActualSize0 = string([imageActualSize UTF8String]);
    
//    string fileName = getFileName(imgURI0);
//    string imgFolderPath = imgURI0.substr(0,imgURI0.find_last_of("/")+1);
//    cout<< fileName <<endl;
    //         Initialize logs
//    createLogs(fileName);
//    //Read original image
//    //  String imgURIOrg = imgURI.substring(0, imgURI.indexOf("_TEMP")) + imgURI.substring(imgURI.indexOf("."));
    cv::Mat srcMat = cv::imread(imgURI0);
    int width = srcMat.cols;
    int height = srcMat.rows;
    
//    rectanglePointsStr0 = "0.813333%0.905172#0.181333%0.878936#0.290000%0.138306#0.804667%0.174663#";
    vector<string> rectanglePoints = split (rectanglePointsStr0, '#');
    for (auto i : rectanglePoints) cout << i << endl;
    
    vector<string> imgSize = split (imageActualSize0, '-');

    vector<cv::Point2f> recPoints;
    cv::Mat2f matOfPoints2f = *new cv::Mat2f();
    
    for (string pointStr : rectanglePoints
         ) {
        vector<string> point = split(pointStr,'-');
        cv::Point2f pointer = *new cv::Point2f((stod(point[0]) / (stod(imgSize[0])) * width), (stod(point[1]) / (stod(imgSize[1])) * height));
        recPoints.push_back(pointer);
    }
    string filePathPng = performPerspectiveTransformation(imgURI0, srcMat, recPoints );
    return convertString2NSString(filePathPng);
    
//    cv::Mat quad = cv::Mat::zeros(norm(recPoints[3] - recPoints[0]), norm(recPoints[0] - recPoints[1]), srcMat.type()); // rows,cols
//
//    vector<cv::Point2f> quad_pts;
//    quad_pts.push_back(cv::Point2f(quad.cols, quad.rows));
//    quad_pts.push_back(cv::Point2f(0, quad.rows));
//    quad_pts.push_back(cv::Point2f(0, 0));
//    quad_pts.push_back(cv::Point2f(quad.cols, 0));
//
//    // Perform transformation
//    cv::Mat transmtx = cv::getPerspectiveTransform(recPoints, quad_pts);
//    cv::warpPerspective(srcMat, quad, transmtx, quad.size());
//
//    cv::Mat thresholdImg = *new cv::Mat();
//    cvtColor(quad, thresholdImg, CV_BGR2GRAY);
//    adaptiveThreshold(thresholdImg, thresholdImg, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C, cv::THRESH_BINARY, 41, 9);
//    vector<int> compression_params;
//    compression_params.push_back(CV_IMWRITE_PNG_COMPRESSION);
//    compression_params.push_back(9);
//    cv::imwrite(imgFolderPath + fileName + "_transformed.png", thresholdImg, compression_params);
////    quadFound = &thresholdImg;
////    string sourcePointsStr = getRectanglePointsInString(source_pts, src.cols,src.rows);
//    return convertString2NSString(imgFolderPath + fileName + "_transformed.png");
}

+ (NSString *) createThumbnailImage:(NSString*)tranformedImageURI
{
    string imageURI = string([tranformedImageURI UTF8String]);
//    string fileName = getFileName(imageURI);
    string fileName = imageURI.substr(imageURI.find("PT_IMG_"), imageURI.find_last_of(".png"));
    
    string imgFolderPath = imageURI.substr(0,imageURI.find_last_of("/")+1);
    cv::Mat srcImg = cv::imread(imageURI);
    cv::Mat desImg;
    //    des_img=cvCreateImage(cvSize(new_width,new_height),src_img->depth(),src_img->channels());
    cv::resize(srcImg,desImg,cv::Size(500, 500),0,0,CV_INTER_CUBIC);
    string thumbnailImgURI = imgFolderPath + "thumbnails/" + "thumb_" + fileName;
    vector<int> compressionParams;
    compressionParams.push_back(CV_IMWRITE_PNG_COMPRESSION);
    compressionParams.push_back(9);
    cv::imwrite(thumbnailImgURI, desImg, compressionParams);
    return convertString2NSString(thumbnailImgURI);
}

string performPerspectiveTransformation(string imgURI0, cv::Mat srcMat, vector<cv::Point2f> recPoints ) {
    
    string fileName = getFileName(imgURI0);
    string imgFolderPath = imgURI0.substr(0,imgURI0.find_last_of("/")+1);
    cout<< fileName <<endl;
    
    cv::Mat quad = cv::Mat::zeros(norm(recPoints[3] - recPoints[0]), norm(recPoints[0] - recPoints[1]), srcMat.type()); // rows,cols
    
    vector<cv::Point2f> quad_pts;
    quad_pts.push_back(cv::Point2f(quad.cols, quad.rows));
    quad_pts.push_back(cv::Point2f(0, quad.rows));
    quad_pts.push_back(cv::Point2f(0, 0));
    quad_pts.push_back(cv::Point2f(quad.cols, 0));
    
    // Perform transformation
    cv::Mat transmtx = cv::getPerspectiveTransform(recPoints, quad_pts);
    cv::warpPerspective(srcMat, quad, transmtx, quad.size());
    
    cv::Mat thresholdImg = *new cv::Mat();
    cvtColor(quad, thresholdImg, CV_BGR2GRAY);
    adaptiveThreshold(thresholdImg, thresholdImg, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C, cv::THRESH_BINARY, 41, 9);
    vector<int> compression_params;
    compression_params.push_back(CV_IMWRITE_PNG_COMPRESSION);
    compression_params.push_back(9);
    string filePathPng =  imgFolderPath + fileName + "_transformed.png";
    cv::imwrite(filePathPng, thresholdImg, compression_params);
    //    quadFound = &thresholdImg;
    //    string sourcePointsStr = getRectanglePointsInString(source_pts, src.cols,src.rows);
    return filePathPng;
}

vector<string> split (const string &str, char delim) {
    vector<string> result;
    stringstream strStream (str);
    string item;
    
    while (getline (strStream, item, delim)) {
        result.push_back (item);
    }
    return result;
}
string getFileName(string imgURI) {
    string prefixStr = "";
    
    size_t imgPos = imgURI.find("IMG_");
    cout<<"Position: "<<imgPos << endl;
    // Assume the image URI starts with IMG_
    if ( imgPos != string::npos) {
        prefixStr = "IMG_";
    }
    
    // Check the file extension
    size_t fileExt = imgURI.find(".jpeg");
    cout<<"Position0: "<<imgPos << endl;
    if (imgURI.find(".jpg") > 0) {
        fileExt = imgURI.find(".jpg");
    }
    
    // Sets the file name stars with "PT_"
    string fileName = "PT_";
    
    // Get the file name
    if (prefixStr == "") {
        fileName = fileName + imgURI.substr(imgURI.find_last_of('/') + 1, fileExt);
    } else {
        fileName = fileName + imgURI.substr(imgURI.find(prefixStr), fileExt);
    }
    return fileName.erase(fileName.find(".jpg"));
}
/**
 Converts C++ string to NSString
 @param imgURI it is a trasnformed image in C++ string
 @return NSString Returns transformed image in NSString
 */
NSString * convertString2NSString(string imgURI) {
    NSString *filePath0NSStr = [NSString stringWithCString:imgURI.c_str()
                                                  encoding:[NSString defaultCStringEncoding]];
    return filePath0NSStr;
}

string getRectanglePointsInString(vector<cv::Point2f> source_pts, int width, int height) {
    //Get captured rectangle points for GUI
    string pointStr = "RPTSTR#";
    for (int i=0; i< source_pts.size(); i++) {
        double pointX = source_pts[i].x;
        if (pointX <= 0) {
            pointX = 1.0;
        }
        double pointY = source_pts[i].y;
        if (pointY <= 0) {
            pointY = 1.0;
        }
        pointStr += to_string(pointX / width) + "%" + to_string(pointY / height) + "#";
 
    }
    return pointStr;
}
@end
