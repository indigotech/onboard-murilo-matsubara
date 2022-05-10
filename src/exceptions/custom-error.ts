export class CustomError extends Error {
  constructor(
    public code: number,
    public message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public additionalInfo?: string | Record<string, any>,
    public name: string = 'CustomError',
  ) {
    super(message);
  }
}
