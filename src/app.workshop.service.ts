import { Injectable } from '@nestjs/common';
import { Map } from './global-api';
import Bluebird from 'bluebird';
import ax from 'axios';
import { FullVolvoItemResponse, KZDLMaps } from './app.types';
import { chunk, each } from 'lodash';

const axios = ax.create({
  baseURL: 'https://api.steampowered.com/ISteamRemoteStorage',
});

@Injectable()
export class WorkshopService {
  async getWorkshopInfoFromMaps(
    kzdlMaps: KZDLMaps,
    maps: Map[],
  ): Promise<void> {
    const workshopIds = maps.map((map) => {
      const params = new URL(map.workshop_url).searchParams;
      return params.get('id');
    });

    const workshopIdsChunks = chunk(workshopIds, 100);

    await Bluebird.map(workshopIdsChunks, async (workshopIdsChunk) => {
      const query = new URLSearchParams({
        itemcount: workshopIdsChunk.length.toString(),
      });

      each(workshopIdsChunk, (workshopId, index) => {
        query.append(`publishedfileids[${index}]`, workshopId);
      });

      const { data: valvoResponse } = await axios.post<FullVolvoItemResponse>(
        `GetPublishedFileDetails/v1/`,
        query.toString(),
      );

      const volvoItems = valvoResponse.response.publishedfiledetails;

      volvoItems.forEach((volvoItem) => {
        if (volvoItem.result !== 1) {
          return;
        }

        kzdlMaps[volvoItem.publishedfileid].ws = volvoItem;
      });
    });
  }
}
