import { BAD_REQUEST_ERROR_CODE } from '../consts';
import { CustomError } from './custom-error';

export class CustomValidationError extends CustomError {
  constructor(public message: string, public additionalInfo?: string, public name: string = 'ValidationError') {
    super(BAD_REQUEST_ERROR_CODE, message, additionalInfo, name);
  }
}
