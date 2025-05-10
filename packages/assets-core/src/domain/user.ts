import * as t from "io-ts";
import type {
  CredenatialsDecoder,
  GetUserDecoder,
  PasswordChangeDecoder,
  PostUserDecoder,
  ProfileDecoder,
} from "../decoders/user";

export type Credentials = t.TypeOf<typeof CredenatialsDecoder>;
export type PasswordChange = t.TypeOf<typeof PasswordChangeDecoder>;
export type GetUser = t.TypeOf<typeof GetUserDecoder>;
export type PostUser = t.TypeOf<typeof PostUserDecoder>;
export type Profile = t.TypeOf<typeof ProfileDecoder>;
export type UserId = GetUser["id"];

export const profile = ({ phash, psalt, ...profile }: GetUser): Profile =>
  profile;

export const defaultCredentials = (): Credentials => ({
  username: "",
  password: "",
});

export const fromProfile = (p: Profile): Credentials => ({
  ...defaultCredentials(),
  username: p.username,
});

export const defaultPasswordChange = (): PasswordChange => ({
  password: "",
  repeat: "",
});
