import { expect, test } from "bun:test";
import {
  newUserValidator,
  passwordChangeValidator,
  postUserValidator,
  type NewUser,
  type PasswordChange,
  type PostUser,
} from "../../src";

const validNewUser: NewUser = {
  admin: false,
  locked: false,
  username: "abc123",
  password: "abc123",
};

const validPwdChange: PasswordChange = {
  oldPassword: "abc123",
  newPassword: "mickey",
  repeat: "mickey",
};

test("passes NewUser validation", () => {
  const { valid } = newUserValidator(validNewUser);
  expect(valid).toBeTrue();
});

test("fails NewUser username validation", () => {
  const newUser: NewUser = {
    ...validNewUser,
    username: "abc",
  };
  const { valid } = newUserValidator(newUser);
  expect(valid).toBeFalse();
});

test("fails PostUser username validation", () => {
  const postUser: PostUser = {
    ...validNewUser,
    username: "123",
    login_attempts: 0,
  };
  const { valid } = postUserValidator(postUser);
  expect(valid).toBeFalse();
});

test("passes change-password", () => {
  const { valid } = passwordChangeValidator(validPwdChange);
  expect(valid).toBeTrue();
});

test("fails change-password different passwords", () => {
  const pwdChange: PasswordChange = {
    ...validPwdChange,
    repeat: "mouse",
  };
  const { valid } = passwordChangeValidator(pwdChange);
  expect(valid).toBeFalse();
});
