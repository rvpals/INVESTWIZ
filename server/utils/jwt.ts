import * as jose from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function createAccessToken(userId: string): Promise<string> {
  return new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

export async function createRefreshToken(userId: string): Promise<string> {
  return new jose.SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  return jose.jwtVerify(token, getSecret());
}
