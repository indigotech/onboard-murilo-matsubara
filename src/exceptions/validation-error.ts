import { CustomError } from './custom-error';

export class CustomValidationError extends CustomError {
  constructor(public message: string, public additionalInfo?: string, public name: string = 'ValidationError') {
    super(400, message, additionalInfo, name);
  }
}
