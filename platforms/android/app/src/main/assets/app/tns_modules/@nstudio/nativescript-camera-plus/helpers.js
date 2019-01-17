"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("tns-core-modules/application");
var image_asset_1 = require("tns-core-modules/image-asset");
var camera_plus_common_1 = require("./camera-plus.common");
function getImageDrawable(iconName) {
    var drawableId = app.android.context
        .getResources()
        .getIdentifier(iconName, 'drawable', app.android.context.getPackageName());
    return drawableId;
}
exports.getImageDrawable = getImageDrawable;
function createImageButton() {
    var btn = new android.widget.ImageButton(app.android.context);
    btn.setPadding(24, 24, 24, 24);
    btn.setMaxHeight(48);
    btn.setMaxWidth(48);
    return btn;
}
exports.createImageButton = createImageButton;
function createTransparentCircleDrawable() {
    var shape = new android.graphics.drawable.GradientDrawable();
    shape.setColor(0x99000000);
    shape.setCornerRadius(96);
    shape.setAlpha(160);
    return shape;
}
exports.createTransparentCircleDrawable = createTransparentCircleDrawable;
function createDateTimeStamp() {
    var result = '';
    var date = new Date();
    result =
        date.getFullYear().toString() +
            (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString()) +
            (date.getDate() < 10 ? '0' + date.getDate().toString() : date.getDate().toString()) +
            '_' +
            date.getHours().toString() +
            date.getMinutes().toString() +
            date.getSeconds().toString();
    return result;
}
exports.createDateTimeStamp = createDateTimeStamp;
function assetFromPath(path, width, height, keepAspectRatio) {
    var asset = new image_asset_1.ImageAsset(path);
    asset.options = {
        width: width,
        height: height,
        keepAspectRatio: keepAspectRatio
    };
    return asset;
}
exports.assetFromPath = assetFromPath;
function getOptimalPreviewSize(sizes, width, height) {
    var ASPECT_TOLERANCE = 0.1;
    var targetRatio = height / width;
    camera_plus_common_1.CLog("targetRatio = " + targetRatio);
    if (sizes === null)
        return null;
    var optimalSize = null;
    var minDiff = Number.MAX_SAFE_INTEGER;
    var targetHeight = height;
    camera_plus_common_1.CLog("targetHeight = " + targetHeight);
    for (var i = 0; i < sizes.size(); i++) {
        var element = sizes.get(i);
        camera_plus_common_1.CLog("size.width = " + element.width + ", size.height = " + element.height);
        var ratio = element.width / element.height;
        camera_plus_common_1.CLog("ratio = " + ratio);
        if (Math.abs(ratio - targetRatio) > ASPECT_TOLERANCE)
            continue;
        if (Math.abs(element.height - targetHeight) < minDiff) {
            optimalSize = element;
            minDiff = Math.abs(element.height - targetHeight);
        }
    }
    if (optimalSize === null) {
        minDiff = Number.MAX_SAFE_INTEGER;
        for (var i = 0; i < sizes.size(); i++) {
            var element = sizes.get(i);
            camera_plus_common_1.CLog("size.width = " + element.width + ", size.height = " + element.height);
            if (Math.abs(element.height - targetHeight) < minDiff) {
                optimalSize = element;
                minDiff = Math.abs(element.height - targetHeight);
            }
        }
    }
    camera_plus_common_1.CLog("optimalSize = " + optimalSize + ", optimalSize.width = " + optimalSize.width + ", optimalSize.height = " + optimalSize.height);
    return optimalSize;
}
exports.getOptimalPreviewSize = getOptimalPreviewSize;
function calculateInSampleSize(options, reqWidth, reqHeight) {
    var height = options.outHeight;
    var width = options.outWidth;
    var inSampleSize = 1;
    if (height > reqHeight || width > reqWidth) {
        var halfHeight = height / 2;
        var halfWidth = width / 2;
        while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
            inSampleSize *= 2;
        }
    }
    return inSampleSize;
}
exports.calculateInSampleSize = calculateInSampleSize;
function getOrientationFromBytes(data) {
    var inputStream = new java.io.ByteArrayInputStream(data);
    var exif;
    if (android.os.Build.VERSION.SDK_INT >= 24) {
        exif = new android.media.ExifInterface(inputStream);
    }
    else {
        exif = new android.support.media.ExifInterface(inputStream);
    }
    var orientation = exif.getAttributeInt(android.media.ExifInterface.TAG_ORIENTATION, android.media.ExifInterface.ORIENTATION_UNDEFINED);
    try {
        inputStream.close();
    }
    catch (ex) {
        camera_plus_common_1.CLog('byteArrayInputStream.close error', ex);
    }
    if (this.cameraId === 1) {
        if (orientation === 1) {
            orientation = 2;
        }
        else if (orientation === 3) {
            orientation = 4;
        }
        else if (orientation === 6) {
            orientation = 7;
        }
    }
    camera_plus_common_1.CLog('Orientation: ', orientation);
    return orientation;
}
exports.getOrientationFromBytes = getOrientationFromBytes;
function createImageConfirmationDialog(data, retakeText, saveText) {
    if (retakeText === void 0) { retakeText = null; }
    if (saveText === void 0) { saveText = null; }
    return new Promise(function (resolve, reject) {
        try {
            debugger;
            var alert_1 = new android.app.AlertDialog.Builder(app.android.foregroundActivity);
            alert_1.setOnDismissListener(new android.content.DialogInterface.OnDismissListener({
                onDismiss: function (dialog) {
                    resolve(false);
                }
            }));
            var layout = new android.widget.LinearLayout(app.android.context);
            layout.setOrientation(1);
            var bitmapFactoryOpts = new android.graphics.BitmapFactory.Options();
            bitmapFactoryOpts.inJustDecodeBounds = true;
            var picture = android.graphics.BitmapFactory.decodeByteArray(data, 0, data.length, bitmapFactoryOpts);
            bitmapFactoryOpts.inSampleSize = calculateInSampleSize(bitmapFactoryOpts, 300, 300);
            bitmapFactoryOpts.inJustDecodeBounds = false;
            picture = android.graphics.BitmapFactory.decodeByteArray(data, 0, data.length, bitmapFactoryOpts);
            var img = new android.widget.ImageView(app.android.context);
            img.setImageBitmap(picture);
            layout.addView(img);
            alert_1.setView(layout);
            alert_1.setNegativeButton(retakeText, new android.content.DialogInterface.OnClickListener({
                onClick: function (dialog, which) {
                    resolve(false);
                }
            }));
            alert_1.setPositiveButton(saveText, new android.content.DialogInterface.OnClickListener({
                onClick: function (dialog, which) {
                    resolve(true);
                }
            }));
            alert_1.show();
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.createImageConfirmationDialog = createImageConfirmationDialog;
//# sourceMappingURL=helpers.js.map