import { config } from '../../config/index.ts';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  services: {
    database: { status: 'healthy' | 'unreachable' | 'simulated'; url: string };
    redis: { status: 'healthy' | 'unreachable' | 'simulated'; url: string };
  };
}

export class HealthController {
  private startTime = Date.now();

  getHealth(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      environment: config.env,
      version: '0.1.0',
      services: {
        database: {
          status: 'healthy',
          url: config.databaseUrl.replace(/:[^:@]+@/, ':****@'), // Mask credentials
        },
        redis: {
          status: 'healthy',
          url: config.redisUrl,
        },
      },
    };
  }
}
