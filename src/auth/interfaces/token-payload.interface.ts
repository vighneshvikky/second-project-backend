export interface TokenPayload {
  sub: string;       
  role: 'user' | 'trainer';
}