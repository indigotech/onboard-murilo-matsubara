import { GraphQLError } from 'graphql';
import { INTERNAL_SERVER_ERROR_CODE } from '../consts';
import { CustomError } from '../exceptions/custom-error';

export function formatError(error: GraphQLError): any {
  const originalError = error.originalError;
  if (originalError instanceof CustomError) {
    return {
      code: originalError.code,
      message: originalError.message,
      additionalInfo: originalError.additionalInfo,
      name: originalError.name,
    };
  } else {
    return {
      code: INTERNAL_SERVER_ERROR_CODE,
      message: 'Unexpected server error',
      additionalInfo: originalError?.message,
      name: originalError?.name,
    };
  }
}
