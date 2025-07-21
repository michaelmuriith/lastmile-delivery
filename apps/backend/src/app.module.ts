// src/app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis-yet';

import { AuthModule } from './auth/auth.module';
import { DeliveryModule } from './delivery/delivery.module';
import { DriverModule } from './driver/driver.module';
import { TrackingModule } from './tracking/tracking.module';
import { PaymentModule } from './payment/payment.module';
import { GeoModule } from './geo/geo.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Set up Redis as a global cache store
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        url: config.get<string>('REDIS_URL'),
        ttl: config.get<number>('CACHE_TTL', 600), // default TTL of
      }),
    }),

    // Feature modules
    AuthModule,
    DeliveryModule,
    DriverModule,
    TrackingModule,
    PaymentModule,
    GeoModule,
    UserModule,
  ],
})
export class AppModule {}
