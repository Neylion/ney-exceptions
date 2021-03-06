"use strict";

import StackUtils from "stack-utils";
const stackTrace = new StackUtils({ cwd: process.cwd(), internals: StackUtils.nodeInternals() });

export interface IException extends IExceptionBase {
  config?: any;
  stack?: any;
  isApplicationError?: boolean;
  location?: string[];
}

export interface IExceptionBase {
  message: string;
  statusCode: number;
  errorCode?: number;
  type: string;
  typeDescription: string;
  innerException?: IException;
  [key: string]: any;
}

export class Exception extends Error implements IException {
  name: string = "Exception";
  message: string;
  statusCode: number = 500;
  errorCode?: number;
  type: string = "unknown";
  typeDescription: string = "Generic exception without specified type.";
  isApplicationError: boolean = true;
  innerException?: any;
  location: string[];
  [key: string]: any;
  constructor(message: string, innerException?: any, stack?: string) {
    super();

    this.stack = stack || this.stack;
    this.message = message;
    this.location = this.stack ? getCallerHistory(this.stack) : ["Could not find error stack trace!"];
    this.innerException = cloneInnerException(innerException);
  }
}

function getCallerHistory(stack: any, limit = 5, callsToIgnore = 0) {
  const errorStack = stackTrace.clean(stack);
  const callSites = errorStack.split("\n");
  const errorTrace: string[] = [];
  for (let i = callsToIgnore; i < limit + callsToIgnore; i++) {
    errorTrace.push(callSites[i]);
  }
  errorTrace.push("For a more detailed stack trace check error stack trace");
  return errorTrace;
}

function cloneInnerException(innerException?: any) {
  let clonedInnerException: any;
  if (innerException) {
    clonedInnerException = {};
    if (innerException.isApplicationError) {
      Object.assign(clonedInnerException, innerException);
    } else {
      // Manual shallow copy of object (as error properties typically are not enumerable and spread operators does not work)
      Object.getOwnPropertyNames(innerException).forEach(key => {
        clonedInnerException[key] = innerException[key];
      });
    }
  }
  return clonedInnerException;
}
