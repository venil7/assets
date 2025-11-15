import * as t from "io-ts";
import type {
  CredenatialsDecoder,
  GetUserDecoder,
  NewUserDecoder,
  PasswordChangeDecoder,
  PostUserDecoder,
  ProfileDecoder,
  RawInUserDecoder,
  RawOutUserDecoder,
  UserIdDecoder,
} from "../decoders/user";

export type Credentials = t.TypeOf<typeof CredenatialsDecoder>;
export type PasswordChange = t.TypeOf<typeof PasswordChangeDecoder>;
export type RawInUser = t.TypeOf<typeof RawInUserDecoder>;
export type RawOutUser = t.TypeOf<typeof RawOutUserDecoder>;
export type NewUser = t.TypeOf<typeof NewUserDecoder>;
export type GetUser = t.TypeOf<typeof GetUserDecoder>;
export type PostUser = t.TypeOf<typeof PostUserDecoder>;
export type Profile = t.TypeOf<typeof ProfileDecoder>;
export type UserId = t.TypeOf<typeof UserIdDecoder>;

export const profile = ({ id, username, admin }: GetUser): Profile => ({
  id,
  username,
  admin,
});

export const defaultCredentials = (): Credentials => ({
  username: "",
  password: "",
});

export const defaultNewUser = (): NewUser => ({
  ...defaultCredentials(),
  admin: false,
  locked: false,
});

export const defaultPasswordChange = (): PasswordChange => ({
  oldPassword: "",
  newPassword: "",
  repeat: "",
});
