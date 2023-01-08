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
      ws: options.ws,
      ftp: options.ftp,
      mapsPath: options.mapsPath
        ? path.resolve(options.mapsPath)
        : path.resolve(__dirname, '..', 'output', 'maps'),
      tiers: options.tiers,
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
    flags: '-m, --maps-path <path>',
    description: 'Specify maps folder. (Defaults to "./output/maps")',
  })
  mapsFolder(val: string): string {
    return val;
  }

  @Option({
    flags: '-t, --tiers <tiers>',
    description: 'Specify tiers.',
  })
  tiers(val: string): number[] {
    return val.split(',').map((tier) => parseInt(tier, 10));
  }
}
