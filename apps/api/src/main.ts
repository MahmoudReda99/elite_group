import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4200';

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:4200'],
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
