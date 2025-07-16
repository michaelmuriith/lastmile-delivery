import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DeliveryModule } from './delivery/delivery.module';
import { DriverModule } from './driver/driver.module';
import { TrackingModule } from './tracking/tracking.module';
import { PaymentModule } from './payment/payment.module';
import { GeoModule } from './geo/geo.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, DeliveryModule, DriverModule, TrackingModule, PaymentModule, GeoModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
