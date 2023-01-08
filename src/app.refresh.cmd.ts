import { Command, CommandRunner, Option } from 'nest-commander';
import { RefreshService } from './app.refresh.service';
import { RefreshCommandOptions } from './app.types';

@Command({
  name: 'refresh',
  description: 'Refresh global api and workshop info.',
})
export class RefreshCommand extends CommandRunner {
  constructor(private readonly refreshService: RefreshService) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RefreshCommandOptions,
  ): Promise<void> {
    if (options.dry) {
      await this.refreshService.run(true);
      return;
    }

    await this.refreshService.run();
  }

  @Option({
    flags: '-d, --dry',
    description: 'Do not save anything.',
  })
  dry(): true {
    return true;
  }
}
