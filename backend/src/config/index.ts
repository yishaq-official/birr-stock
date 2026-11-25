export interface AppConfig {
  env: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  corsOrigin: string;
}

export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://birrstock:birrstock_dev_password@localhost:5432/birrstock_db',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_enterprise_jwt_key_birrstock_2026_dev',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
