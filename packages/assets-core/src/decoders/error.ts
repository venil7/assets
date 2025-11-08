import * as t from "io-ts";
import { EnumDecoder } from "./util";

export enum AppErrorType {
  General = "General",
  Validation = "Validation",
  Auth = "Auth",
}

const appErrorMessage = {
  message: t.string,
};

const appErrorType = {
  type: EnumDecoder(AppErrorType),
  ...appErrorMessage,
};

export const AppErrorMessageDecoder = t.type(appErrorMessage);
export const AppErrorDecoder = t.type(appErrorType);

export const AnyDecoder = t.record(t.string, t.any);
