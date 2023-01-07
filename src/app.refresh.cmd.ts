import { Command, CommandRunner } from 'nest-commander';
import { RefreshService } from './app.refresh.service';

@Command({ name: 'refresh', description: 'Do the damn thang.' })
export class RefreshCommand extends CommandRunner {
  constructor(private readonly refreshService: RefreshService) {
    super();
  }

  async run(_passedParam: string[]): Promise<void> {
    await this.refreshService.run();
  }
}
