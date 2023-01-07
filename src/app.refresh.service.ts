import { Injectable } from '@nestjs/common';
import { WorkshopService } from './app.workshop.service';
import { Map } from './global-api';
import Bluebird from 'bluebird';
import { KZDLMap, KZDLMaps } from './app.types';
import axios from 'axios';
import { GOKZAPIService } from './app.gokz-api.service';

import * as path from 'node:path';
import * as fs from 'fs-extra';

const mapsPath = path.resolve(__dirname, '..', 'maps.json');

@Injectable()
export class RefreshService {
  constructor(
    private readonly workshopService: WorkshopService,
    private readonly gokzApiService: GOKZAPIService,
  ) {}

  createKZDLMapsFromApiResponse(globalApiMaps: Map[]) {
    const kzdlMaps: KZDLMaps = {};

    globalApiMaps.forEach((globalApiMap) => {
      const params = new URL(globalApiMap.workshop_url).searchParams;
      const id = params.get('id');

      const kzdlMap: KZDLMap = {
        id,
        globalApiMap: globalApiMap,
      };

      kzdlMaps[id] = kzdlMap;
    });

    return kzdlMaps;
  }

  async getFTPPathsForMissingWorkshopFiles(kzdlMaps: KZDLMaps) {
    const kzdlMapsKeys = Object.keys(kzdlMaps);

    await Bluebird.map(kzdlMapsKeys, async (kzdlMapId) => {
      const kzdlMap = kzdlMaps[kzdlMapId];

      if (kzdlMap.ws) {
        return;
      }

      const map = kzdlMaps[kzdlMapId];
      const mapName = map.globalApiMap.name;

      const bspPath = `https://maps.global-api.com/bsps/${mapName}.bsp`;

      try {
        await axios.head(bspPath);
        map.bsp = bspPath;
      } catch {
        console.warn(`${mapName} is missing EVERYWHERE!!!`);
      }
    });
  }

  async run() {
    const globalApiMaps = await this.gokzApiService.getGlobalApiMaps();
    const kzdlMaps = this.createKZDLMapsFromApiResponse(globalApiMaps);
    await this.workshopService.getWorkshopInfoFromMaps(kzdlMaps, globalApiMaps);
    await this.getFTPPathsForMissingWorkshopFiles(kzdlMaps);

    await fs.writeJSON(mapsPath, kzdlMaps, {
      spaces: 2,
    });

    const kzdlMapsKeys = Object.keys(kzdlMaps);
    console.log(`A total of ${kzdlMapsKeys.length} maps.`);
  }
}
