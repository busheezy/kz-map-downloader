import { Command, CommandRunner, Option } from 'nest-commander';
import { DownloadService } from './app.dl.service';

interface RefreshCommandOptions {
  ws?: true;
  ftp?: true;
}

@Command({ name: 'dl', description: 'Download the maps.' })
export class DownloadCommand extends CommandRunner {
  constructor(private readonly downloadService: DownloadService) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RefreshCommandOptions,
  ): Promise<void> {
    this.downloadService.run(options.ws, options.ftp);
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
}
