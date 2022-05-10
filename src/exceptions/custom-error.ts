export type AdditionalInfo = string | object;

export class CustomError extends Error {
  constructor(
    public code: number,
    public message: string,
    public additionalInfo?: AdditionalInfo,
    public name: string = 'CustomError',
  ) {
    super(message);
  }
}
