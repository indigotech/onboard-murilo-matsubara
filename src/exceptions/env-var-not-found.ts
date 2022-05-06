export class EnvironmentVariableNotFound extends Error {
  constructor(environmentVariable: string) {
    super(`Environment variable '${environmentVariable}' was not found.`);
    this.name = 'EnvironmentVariableNotFound';
  }
}
