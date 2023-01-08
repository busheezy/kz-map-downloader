import { Map } from './global-api';

export interface FullVolvoItemResponse {
  response: VolvoItemResponse;
}

export interface VolvoItemResponse {
  result: number;
  resultcount: number;
  publishedfiledetails: VolvoItem[];
}

export interface VolvoItem {
  publishedfileid: string;
  result: number;
  creator: string;
  creator_app_id: number;
  consumer_app_id: number;
  filename: string;
  file_size: number;
  file_url: string;
  hcontent_file: string;
  preview_url: string;
  hcontent_preview: string;
  title: string;
  description: string;
  time_created: number;
  time_updated: number;
  visibility: number;
  banned: number;
  ban_reason: string;
  subscriptions: number;
  favorited: number;
  lifetime_subscriptions: number;
  lifetime_favorited: number;
  views: number;
  tags: { tag: string }[];
}

export interface KZDLMapBsp {
  url: string;
  size: number;
}

export interface KZDLMap {
  id: string;
  globalApiMap: Map;
  ws?: VolvoItem;
  bsp?: KZDLMapBsp;
}

export type KZDLMaps = Record<string, KZDLMap>;

export interface RefreshCommandOptions {
  dry?: true;
}

export interface DownloadCommandOptions {
  ws?: true;
  ftp?: true;
  mapsPath?: string;
  tiers?: number[];
}
