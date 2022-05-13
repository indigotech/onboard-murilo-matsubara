import { UNAUTHORIZED_ERROR_CODE } from '../consts';
import { AdditionalInfo, CustomError } from './custom-error';

export class UnauthenticatedError extends CustomError {
  constructor(public message: string, public additionalInfo?: AdditionalInfo, public name = 'UnauthorizedError') {
    super(UNAUTHORIZED_ERROR_CODE, message, additionalInfo, name);
  }
}
