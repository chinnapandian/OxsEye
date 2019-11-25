import { Injectable } from '@angular/core';
import { File, knownFolders } from 'tns-core-modules/file-system';

import * as Permissions from 'nativescript-permissions';
import * as Toast from 'nativescript-toast';
declare var android: any;
declare var java: any;
declare var org: any;

/** A simple logger class, which is being used to write log information to a file OxsEye.log */
@Injectable()
export class OxsEyeLogger {

  /** File identifier for log file OxsEye.log */
  private file: File;
  /** Log message separator */
  public ERROR_MSG_SEPARATOR = ': ';

  /** Constructor for OxsEyeLogger */
  public constructor() {
    // [android.Manifest.permission.CAMERA,
    //   android.Manifest.permission.READ_EXTERNAL_STORAGE,
    //   android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
    Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
      android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
      'Needed for sharing files').then(() => {
        const appRootPath = knownFolders.currentApp();
        if (!this.file) {
          this.file = File.fromPath(appRootPath.path + '/log/oxseye.log');
          this.file.removeSync((error) => {
            Toast.makeText('Error while clearing OxsEye log file..');
          });
        }
        this.file = File.fromPath(appRootPath.path + '/log/oxseye.log');
      }).catch((e) => {
        Toast.makeText('Error while giving permission to oxseye.log file.', 'long').show();
        console.log('Permission is not granted (sadface)',e);
      });
  }
  /** Method to log message in debug level
   *
   * @param message Message to be written to log file
   * @param optionalParams optional parameters to be written if any along with original message
   */
  public debug(message?: any, ...optionalParams: any[]): void {
    this.append('DEBUG', `${message} ${JSON.stringify(optionalParams)}`);
  }
  /** Method to log message in info level
   *
   * @param message Message to be written to log file
   * @param optionalParams optional parameters to be written if any along with original message
   */
  public info(message?: any, ...optionalParams: any[]): void {
    this.append('INFO ', `${message} ${JSON.stringify(optionalParams)}`);
  }
  /** Method to log message in warning level
   *
   * @param message Message to be written to log file
   * @param optionalParams optional parameters to be written if any along with original message
   */
  public warn(message?: any, ...optionalParams: any[]): void {
    this.append('WARN ', `${message} ${JSON.stringify(optionalParams)}`);
  }
  /** Method to log message in error level
   *
   * @param message Message to be written to log file
   * @param optionalParams optional parameters to be written if any along with original message
   */
  public error(message?: any, ...optionalParams: any[]): void {
    this.append('ERROR', `${message} ${JSON.stringify(optionalParams)}`);
  }
  /** Method to append message in log file OxsEye.log.
   * Acutally, it reads the existing contents and adds it with new coming
   * message and writes to the log file.
   *
   * @param type indicates what type of message is it, like 'debug', 'info', 'warn' or 'error'
   */
  private append(type: string, message: string) {
    let content = this.file.readTextSync((error: any) => {
      Toast.makeText('Error while reading logs. ' + error, 'long').show();
    });
    content = content + '\n' + new Date().toISOString() + ' ' + type + message;
    this.file.writeTextSync(`${content}`);
  }
}
