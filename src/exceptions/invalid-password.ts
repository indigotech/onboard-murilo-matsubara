import { PasswordRule } from '../utils/password';
import { CustomValidationError } from './custom-validation-error';
import { UnexepectedBehaviorError } from './unexpected-behavior-error';

export class InvalidPassword extends CustomValidationError {
  constructor(brokenRules: PasswordRule[], rulesMessages: Record<PasswordRule, string>) {
    if (brokenRules.length == 0) {
      throw new UnexepectedBehaviorError('An InvalidPassword error was thrown with an empty brokenRules list');
    }

    const message = 'Invalid password';
    const additionalInfo = `Password: ${brokenRules.map((rule) => rulesMessages[rule])}`;
    super(message, additionalInfo, 'InvalidPassword');
  }
}
