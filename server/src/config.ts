import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'freshmart-super-secret-jwt-key-2026-secure',
  isProduction: process.env.NODE_ENV === 'production',
  cookieMaxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
};
