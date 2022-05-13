export class CustomError extends Error {
  constructor(
    public code: number,
    public message: string,
    public additionalInfo?: string | object,
    public name: string = 'CustomError',
  ) {
    super(message);
  }
}
