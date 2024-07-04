import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './config/app.module';
import globalConfig from './config/global.config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AuthGuard } from './guard/auth.guard';
import { JwtAccessService } from './service/jwt/jwt-access.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // JWT guard
  app.useGlobalGuards(
    new AuthGuard(app.get(Reflector), new JwtAccessService()),
  );

  // input validation and dto transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // cors and security
  app.enableCors({
    origin: [globalConfig().allowOrigin],
    methods: ['OPTIONS', 'GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Authorization',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
  });
  app.use(helmet());

  await app.listen(globalConfig().port);
}
bootstrap().then(() =>
  console.log(`
  __ _     _                    _                    
 / _(_)___| |__   ___ _ __ ___ (_)  _ __ _   _ _ __  
| |_| / __| '_ \\ / _ \\ '_ \` _ \\| | | '__| | | | '_ \\ 
|  _| \\__ \\ | | |  __/ | | | | | | | |  | |_| | | | |
|_| |_|___/_| |_|\\___|_| |_| |_|_| |_|   \\__,_|_| |_|

`),
);
