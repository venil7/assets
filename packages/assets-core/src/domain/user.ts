import * as t from "io-ts";
import type {
  CredenatialsDecoder,
  GetUserDecoder,
  PostUserDecoder,
  ProfileDecoder,
} from "../decoders/user";

export type Credentials = t.TypeOf<typeof CredenatialsDecoder>;
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
