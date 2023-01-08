import { Module } from '@nestjs/common';
import { RefreshCommand } from './app.refresh.cmd';
import { GOKZAPIService } from './app.gokz-api.service';
import { WorkshopService } from './app.workshop.service';
import { RefreshService } from './app.refresh.service';
import { DownloadService } from './app.dl.service';
import { DownloadCommand } from './app.dl.cmd';
import { MapsCacheService } from './app.maps-cache.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    WorkshopService,
    GOKZAPIService,
    RefreshService,
    RefreshCommand,
    DownloadService,
    DownloadCommand,
    MapsCacheService,
  ],
})
export class AppModule {}
