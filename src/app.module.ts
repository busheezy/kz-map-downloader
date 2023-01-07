import { Module } from '@nestjs/common';
import { RefreshCommand } from './app.refresh.cmd';
import { GOKZAPIService } from './app.gokz-api.service';
import { WorkshopService } from './app.workshop.service';
import { RefreshService } from './app.refresh.service';

@Module({
  imports: [],
  controllers: [],
  providers: [WorkshopService, GOKZAPIService, RefreshService, RefreshCommand],
})
export class AppModule {}
