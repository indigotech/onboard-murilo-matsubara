import bcrypt from 'bcrypt';
import { EnvironmentVariableNotFound } from '../exceptions/env-var-not-found';

type PasswordRule = 'contain_digit' | 'contain_letter' | 'min_size_6';
type PasswordRuleChecker = (password: string) => boolean;

const passwordRules: Record<PasswordRule, PasswordRuleChecker> = {
  contain_digit: (password) => /\d+/.test(password),
  contain_letter: (password) => /[a-zA-Z]+/.test(password),
  min_size_6: (password) => /.{6,}/.test(password),
};

export const rulesErrorMessage: Record<PasswordRule, string> = {
  contain_digit: 'must contain 1 digit',
  contain_letter: 'must contain 1 letter',
  min_size_6: 'must have at least 6 characters',
};

export const isPasswordValid = (password: string) => {
  const brokenRules = getBrokenPasswordRules(password);
  return {
    valid: brokenRules.length == 0,
    brokenRules,
  };
};

export const getBrokenPasswordRules = (password: string) =>
  Object.entries(passwordRules)
    .filter(([_, isRuleOk]) => !isRuleOk(password))
    .map(([ruleName]) => ruleName) as PasswordRule[];

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
