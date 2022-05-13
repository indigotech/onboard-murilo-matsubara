import { CustomValidationError } from './custom-validation-error';

export class InvalidLoginCredentials extends CustomValidationError {
  constructor() {
    super(
      'Invalid email or password',
      'No user with a matching email and password was found',
      'InvalidLoginCredentials',
    );
  }
}
