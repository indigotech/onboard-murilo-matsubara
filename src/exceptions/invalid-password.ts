import { PasswordRule } from '../utils/password';
import { CustomValidationError } from './validation-error';

export class InvalidPassword extends CustomValidationError {
  constructor(brokenRules: PasswordRule[], rulesMessages: Record<PasswordRule, string>) {
    if (brokenRules.length == 0) {
      super('Password should be ok', 'No broken rules were provided, check the backend code');
      return;
    }

    const message = 'Invalid password';
    const additionalInfo = `Password: ${brokenRules.map((rule) => rulesMessages[rule])}`;
    super(message, additionalInfo, 'InvalidPassword');
  }
}
