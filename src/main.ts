import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';
import Axios from 'axios';

Axios.defaults.baseURL = 'https://kztimerglobal.com';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
