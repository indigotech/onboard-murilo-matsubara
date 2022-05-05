import bcrypt from 'bcrypt';
import { DEFAULT_PASSWORD_HASH_ROUNDS } from '../consts';

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

if (!process.env.PASSWORD_HASH_SALT) {
  throw new ReferenceError('Environment variable `PASSWORD_HASH_SALT` was not found.');
}

const saltPassword = (password: string) => `${process.env.PASSWORD_HASH_SALT}_${password}`;

export const hashPassword = (password: string) => bcrypt.hash(saltPassword(password), DEFAULT_PASSWORD_HASH_ROUNDS);

export const checkPassword = (unhashedPassword: string, hashedPassword: string) =>
  bcrypt.compare(saltPassword(unhashedPassword), hashedPassword);
