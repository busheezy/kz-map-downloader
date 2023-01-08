import { Injectable } from '@nestjs/common';
import { KZDLMaps } from './app.types';

import * as path from 'node:path';
import * as fs from 'fs-extra';

const mapsPath = path.resolve(__dirname, '..', 'maps.json');

@Injectable()
export class MapsCacheService {
  async save(kzdlMaps: KZDLMaps) {
    await fs.writeJSON(mapsPath, kzdlMaps, {
      spaces: 2,
    });
  }

  async read(): Promise<KZDLMaps> {
    return await fs.readJSON(mapsPath);
  }
}
