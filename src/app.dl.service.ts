import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Bluebird from 'bluebird';
import fs from 'fs-extra';
import * as unzipper from 'unzipper';
import { MapsCacheService } from './app.maps-cache.service';
import { DownloadCommandOptions, KZDLMap, KZDLMaps } from './app.types';
import * as path from 'node:path';

@Injectable()
export class DownloadService {
  constructor(private readonly mapCacheService: MapsCacheService) {}

  async run(downloadCommandOptions: DownloadCommandOptions) {
    const maps = await this.mapCacheService.read();

    if (downloadCommandOptions.ws && !downloadCommandOptions.ftp) {
      await this.getWSMaps(downloadCommandOptions, maps);
      return;
    }

    if (downloadCommandOptions.ftp && !downloadCommandOptions.ws) {
      await this.getFTPMaps(downloadCommandOptions, maps);
      return;
    }

    await this.getWSMaps(downloadCommandOptions, maps);
    await this.getFTPMaps(downloadCommandOptions, maps);
  }

  async downloadIfDifferent(
    url: string,
    outputPath: string,
    map: KZDLMap,
    workshop?: true,
  ) {
    try {
      const fileStat = await fs.stat(outputPath);
      if (fileStat.size === map.globalApiMap.filesize) {
        console.log('Skipping:', map.globalApiMap.name);
        return;
      }
    } catch {}

    await this.download(url, outputPath, true);

    console.log(
      'Downloaded: ',
      map.globalApiMap.name,
      workshop ? 'from workshop.' : 'from ftp.',
    );

    const fileStatAfter = await fs.stat(outputPath);

    if (fileStatAfter.size !== map.globalApiMap.filesize) {
      console.warn('File size does not match.');
    }
  }

  async getFTPMaps(
    downloadCommandOptions: DownloadCommandOptions,
    maps: KZDLMaps,
  ) {
    await fs.ensureDir(downloadCommandOptions.mapsPath);
    const mapKeys = Object.keys(maps);

    const ftpMapKeys = mapKeys.filter((key) => {
      const map = maps[key];

      if (
        downloadCommandOptions.tiers &&
        !downloadCommandOptions.tiers.includes(map.globalApiMap.difficulty)
      ) {
        return false;
      }

      return !!map.bsp;
    });

    await Bluebird.map(
      ftpMapKeys,
      async (ftpMapKey) => {
        const map = maps[ftpMapKey];

        const outputPath = path.join(
          downloadCommandOptions.mapsPath,
          `${map.globalApiMap.name}.bsp`,
        );

        await this.downloadIfDifferent(map.bsp.url, outputPath, map);
      },
      {
        concurrency: 2,
      },
    );
  }

  async getWSMaps(
    downloadCommandOptions: DownloadCommandOptions,
    maps: KZDLMaps,
  ) {
    const workshopMapsPath = path.resolve(
      downloadCommandOptions.mapsPath,
      'workshop',
    );

    await fs.ensureDir(downloadCommandOptions.mapsPath);
    await fs.ensureDir(workshopMapsPath);
    const mapKeys = Object.keys(maps);

    const wsMapKeys = mapKeys.filter((key) => {
      const map = maps[key];

      if (
        downloadCommandOptions.tiers &&
        !downloadCommandOptions.tiers.includes(map.globalApiMap.difficulty)
      ) {
        return false;
      }

      return !!map.ws;
    });

    await Bluebird.map(
      wsMapKeys,
      async (wsMapKey) => {
        const map = maps[wsMapKey];

        const workshopMapPath = path.resolve(
          downloadCommandOptions.mapsPath,
          'workshop',
          map.id,
        );

        await fs.ensureDir(workshopMapPath);

        const outputPath = path.join(
          workshopMapPath,
          `${map.globalApiMap.name}.bsp`,
        );

        await this.downloadIfDifferent(map.ws.file_url, outputPath, map, true);
      },
      {
        concurrency: 4,
      },
    );
  }

  async download(url: string, path: string, unzip?: true) {
    const file = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writeStream = fs.createWriteStream(path);

    if (unzip) {
      file.data
        .pipe(unzipper.Parse())
        .on('entry', (entry: unzipper.Entry): void => {
          entry.pipe(writeStream);
        });
    } else {
      file.data.pipe(writeStream);
    }

    await new Promise((resolve, reject): void => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }
}
