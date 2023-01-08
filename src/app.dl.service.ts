import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Bluebird from 'bluebird';
import fs from 'fs-extra';
import * as unzipper from 'unzipper';
import { MapsCacheService } from './app.maps-cache.service';
import { KZDLMaps } from './app.types';
import * as path from 'node:path';

const mapsPath = path.resolve(__dirname, '..', 'maps');
const workshopMapsPath = path.resolve(__dirname, '..', 'maps', 'workshop');

@Injectable()
export class DownloadService {
  constructor(private readonly mapCacheService: MapsCacheService) {}

  async run(ws?: true, ftp?: true) {
    const maps = await this.mapCacheService.read();

    if (ws && !ftp) {
      await this.getWSMaps(maps);
      return;
    }

    if (ftp && !ws) {
      await this.getFTPMaps(maps);
      return;
    }

    await this.getWSMaps(maps);
    await this.getFTPMaps(maps);
  }

  async getFTPMaps(maps: KZDLMaps) {
    await fs.ensureDir(mapsPath);
    const mapKeys = Object.keys(maps);

    const ftpMapKeys = mapKeys.filter((key) => {
      const map = maps[key];
      return !!map.bsp;
    });

    await Bluebird.map(
      ftpMapKeys,
      async (ftpMapKey) => {
        const map = maps[ftpMapKey];
        const outputPath = path.join(mapsPath, `${map.globalApiMap.name}.bsp`);

        try {
          const fileStat = await fs.stat(outputPath);
          if (fileStat.size === map.globalApiMap.filesize) {
            console.log('Skipping:', map.globalApiMap.name);
            return;
          }
        } catch {}

        await this.download(map.bsp.url, outputPath);
        console.log('Downloaded: ', map.globalApiMap.name, 'from ftp.');

        const fileStatAfter = await fs.stat(outputPath);

        if (fileStatAfter.size !== map.globalApiMap.filesize) {
          console.warn('File size does not match.');
        }
      },
      {
        concurrency: 2,
      },
    );
  }

  async getWSMaps(maps: KZDLMaps) {
    await fs.ensureDir(mapsPath);
    await fs.ensureDir(workshopMapsPath);
    const mapKeys = Object.keys(maps);

    const wsMapKeys = mapKeys.filter((key) => {
      const map = maps[key];
      return !!map.ws;
    });

    await Bluebird.map(
      wsMapKeys,
      async (wsMapKey) => {
        const map = maps[wsMapKey];

        const workshopMapPath = path.resolve(mapsPath, 'workshop', map.id);
        await fs.ensureDir(workshopMapPath);

        const outputPath = path.join(
          workshopMapPath,
          `${map.globalApiMap.name}.bsp`,
        );

        try {
          const fileStat = await fs.stat(outputPath);
          if (fileStat.size === map.globalApiMap.filesize) {
            console.log('Skipping:', map.globalApiMap.name);
            return;
          }
        } catch {}

        await this.download(map.ws.file_url, outputPath, true);
        console.log('Downloaded: ', map.globalApiMap.name, 'from workshop.');

        const fileStatAfter = await fs.stat(outputPath);

        if (fileStatAfter.size !== map.globalApiMap.filesize) {
          console.warn('File size does not match.');
        }
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
