import { INTERNAL_SERVER_ERROR_CODE } from '../consts';

export class UnexepectedBehaviorError extends Error {
  constructor(public detailedMessage: string, public code = INTERNAL_SERVER_ERROR_CODE) {
    super('Unexpected error');
    this.name = 'UnexepectedBehaviorError';
  }
}
