import { Request } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { UnauthenticatedError } from '../exceptions/unauthenticated-error';
import { Env } from './env';

export interface TokenPayload {
  id: number;
  name: string;
  email: string;
  birthDate: string;
}

export function verifyRequestAuthentication(request: Request): TokenPayload {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    throw new UnauthenticatedError(
      'You must be logged in',
      'No jwt token was provided in the Authorization header',
      'NoJwtToken',
    );
  }

  try {
    const token = extractToken(authHeader);

    return verifyJwt(token) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthenticatedError('Login expired', 'Jwt token is expired', 'JwtTokenExpired');
    }

    if (error instanceof JsonWebTokenError) {
      throw new UnauthenticatedError('You must be logged in', 'Invalid jwt token', 'InvalidJwtToken');
    }

    throw error;
  }
}

function extractToken(authHeader: string) {
  return authHeader.replace('Bearer', '').trim();
}

export function signJwt(payload: string | Buffer | object, options?: jwt.SignOptions) {
  return jwt.sign(payload, Env.JWT_SECRET, options);
}

export function verifyJwt(token: string, options?: jwt.VerifyOptions & { complete?: false }) {
  return jwt.verify(token, Env.JWT_SECRET, options);
}
