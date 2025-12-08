import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint
   * GET /health
   * @returns Health status của ứng dụng và Redis
   */
  @Get('health')
  async getHealth() {
    const redisHealth = await this.redisService.checkHealth();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        redis: {
          status: redisHealth ? 'connected' : 'disconnected',
          healthy: redisHealth,
        },
      },
    };
  }
}
