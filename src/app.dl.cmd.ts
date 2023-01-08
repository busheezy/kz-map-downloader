import { Command, CommandRunner, Option } from 'nest-commander';
import { DownloadService } from './app.dl.service';
import * as path from 'node:path';
import { DownloadCommandOptions } from './app.types';

@Command({ name: 'dl', description: 'Download the maps.' })
export class DownloadCommand extends CommandRunner {
  constructor(private readonly downloadService: DownloadService) {
    super();
  }

  async run(
    _passedParam: string[],
    options: DownloadCommandOptions,
  ): Promise<void> {
    this.downloadService.run({
      ...options,
      mapsPath: path.resolve(options.mapsPath),
      mapListPath: path.resolve(options.mapListPath),
    });
  }

  @Option({
    flags: '-w, --ws',
    description: 'Only download files from workshop.',
  })
  ws(): true {
    return true;
  }

  @Option({
    flags: '-f, --ftp',
    description: 'Only download files from FTP.',
  })
  ftp(): true {
    return true;
  }

  @Option({
    flags: '-n, --nav',
    description: 'Create nav files.',
  })
  nav(): true {
    return true;
  }

  @Option({
    flags: '-t, --tiers <tiers>',
    description: 'Specify tiers.',
  })
  tiers(val: string): number[] {
    return val.split(',').map((tier) => parseInt(tier, 10));
  }

  @Option({
    flags: '-m, --maps-path <path>',
    description: 'Specify maps folder.',
    defaultValue: './output/maps',
  })
  mapsFolder(val: string): string {
    return path.resolve(val);
  }

  @Option({
    flags: '-l, --map-list-path [path]',
    description: 'Create a map list.',
    defaultValue: './output/mapcycle.txt',
  })
  mapList(val: string): string {
    return path.resolve(val);
  }
}
