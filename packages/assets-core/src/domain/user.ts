import * as t from "io-ts";
import type {
  LoginDecoder,
  ProfileDecoder,
  UserDecoder,
} from "../decoders/user";

export type Login = t.TypeOf<typeof LoginDecoder>;
export type User = t.TypeOf<typeof UserDecoder>;
export type Profile = t.TypeOf<typeof ProfileDecoder>;

export const profile = ({ phash, psalt, ...profile }: User) => profile;
