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
        console.warn(`${mapName} can't be found.`);
      }
    });
  }

  outputResults(kzdlMaps: KZDLMaps) {
    let missingMaps = 0;
    let wsMaps = 0;
    let ftpMaps = 0;

    const kzdlMapsKeys = Object.keys(kzdlMaps);

    kzdlMapsKeys.forEach((kzdlMapsKey) => {
      const kzdlMap = kzdlMaps[kzdlMapsKey];

      if (kzdlMap.ws) {
        wsMaps += 1;
      } else if (kzdlMap.bsp) {
        ftpMaps += 1;
      } else {
        missingMaps += 1;
      }
    });

    console.log(`\nA total of ${kzdlMapsKeys.length} maps.`);
    console.log('WS:', wsMaps);
    console.log('FTP:', ftpMaps);
    console.log('Missing:', missingMaps);
  }

  async run(dry = false) {
    const globalApiMaps = await this.gokzApiService.getGlobalApiMaps();
    const kzdlMaps = this.createKZDLMapsFromApiResponse(globalApiMaps);
    await this.workshopService.getWorkshopInfoFromMaps(kzdlMaps, globalApiMaps);
    await this.getFTPPathsForMissingWorkshopFiles(kzdlMaps);

    this.outputResults(kzdlMaps);

    if (dry) {
      console.log('Nothing has been saved.');
    } else {
      await fs.writeJSON(mapsPath, kzdlMaps, {
        spaces: 2,
      });

      console.log('Saved to maps.json');
    }
  }
}
