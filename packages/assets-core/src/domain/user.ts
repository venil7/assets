import * as t from "io-ts";
import type {
  CredenatialsDecoder,
  ProfileDecoder,
  UserDecoder,
} from "../decoders/user";

export type Credentials = t.TypeOf<typeof CredenatialsDecoder>;
export type User = t.TypeOf<typeof UserDecoder>;
export type Profile = t.TypeOf<typeof ProfileDecoder>;

export const profile = ({ phash, psalt, ...profile }: User): Profile => profile;

export const defaultCredentials = (): Credentials => ({
  username: "",
  password: "",
});
