import { Injectable } from '@nestjs/common';
import { MapsService } from './global-api';

@Injectable()
export class GOKZAPIService {
  async getGlobalApiMaps() {
    const globalApiMaps = await MapsService.getApiVMaps(
      '2',
      null,
      null,
      null,
      null,
      true,
      null,
      null,
      null,
      null,
      5000,
    );

    return globalApiMaps;
  }
}
