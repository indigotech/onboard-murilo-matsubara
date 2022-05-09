import crypto from 'crypto';
import { PASSWORD_MIN_LENGTH, SALT_SEPARATOR } from '../consts';
import { Env } from './env';

type PasswordRule = 'contain_digit' | 'contain_letter' | 'min_length';
type PasswordRuleChecker = (password: string) => boolean;

const passwordRules: Record<PasswordRule, PasswordRuleChecker> = {
  contain_digit: (password) => /\d+/.test(password),
  contain_letter: (password) => /[a-zA-Z]+/.test(password),
  min_length: (password) => RegExp(`.{${PASSWORD_MIN_LENGTH},}`).test(password),
};

export const rulesErrorMessage: Record<PasswordRule, string> = {
  contain_digit: 'must contain 1 digit',
  contain_letter: 'must contain 1 letter',
  min_length: `must have at least ${PASSWORD_MIN_LENGTH} characters`,
};

export const isPasswordValid = (password: string) => {
  const brokenRules = getBrokenPasswordRules(password);
  return {
    valid: brokenRules.length === 0,
    brokenRules,
  };
};

export const getBrokenPasswordRules = (password: string) =>
  Object.entries(passwordRules)
    .filter(([_, isRuleOk]) => !isRuleOk(password))
    .map(([ruleName]) => ruleName) as PasswordRule[];

export function hashPassword(password: string) {
  return new Promise<string>((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');

    crypto.scrypt(password, salt, Env.PASSWORD_KEY_LENGTH, (error, hashedPassword) => {
      if (error) {
        reject(error);
      }
      resolve(saltPassword(salt, hashedPassword.toString('hex')));
    });
  });
}

export function checkPassword(unhashedPassword: string, saltedHashedPassword: string) {
  return new Promise<boolean>((resolve, reject) => {
    const [salt, hashedPassword] = parseSaltedPassword(saltedHashedPassword);
    crypto.scrypt(unhashedPassword, salt, Env.PASSWORD_KEY_LENGTH, (error, hashedPasswordToCheck) => {
      if (error) {
        reject(error);
      }
      resolve(hashedPassword === hashedPasswordToCheck.toString('hex'));
    });
  });
}

function saltPassword(salt: string, password: string) {
  return `${salt}${SALT_SEPARATOR}${password}`;
}

function parseSaltedPassword(saltedPassword: string) {
  return saltedPassword.split(SALT_SEPARATOR);
}
