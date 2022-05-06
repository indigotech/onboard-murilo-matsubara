import bcrypt from 'bcrypt';
import { EnvironmentVariableNotFound } from '../exceptions/env-var-not-found';

type PasswordRules = 'must contain 1 digit' | 'must contain 1 letter' | 'must have at least six characters';
type PasswordRuleChecker = (password: string) => boolean;

const passwordRules: Record<PasswordRules, PasswordRuleChecker> = {
  'must contain 1 digit': (password) => /\d+/.test(password),
  'must contain 1 letter': (password) => /[a-zA-Z]+/.test(password),
  'must have at least six characters': (password) => /.{6,}/.test(password),
};

export const isPasswordValid = (password: string) => {
  const brokenRules: string[] = getBrokenPasswordRules(password);
  return {
    valid: brokenRules.length == 0,
    brokenRules,
  };
};

export const getBrokenPasswordRules = (password: string) =>
  Object.entries(passwordRules)
    .filter(([_, isRuleOk]) => !isRuleOk(password))
    .map(([ruleName]) => ruleName);

export function hashPassword(password: string) {
  if (!process.env.PASSWORD_HASH_ROUNDS) {
    throw new EnvironmentVariableNotFound('PASSWORD_HASH_ROUNDS');
  }
  return bcrypt.hash(saltPassword(password), parseInt(process.env.PASSWORD_HASH_ROUNDS));
}

export function checkPassword(unhashedPassword: string, hashedPassword: string) {
  return bcrypt.compare(saltPassword(unhashedPassword), hashedPassword);
}

function saltPassword(password: string) {
  if (!process.env.PASSWORD_HASH_SALT) {
    throw new EnvironmentVariableNotFound('PASSWORD_HASH_SALT');
  }

  return `${process.env.PASSWORD_HASH_SALT}_${password}`;
}
