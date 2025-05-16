import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser'
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
  })
 app.useGlobalPipes(new ValidationPipe({
  whitelist: true,      // strips unknown properties
  forbidNonWhitelisted: true, // throws error for unknown properties
  transform: true,      // auto-transform payloads to DTO classes
  errorHttpStatusCode: 400,
  disableErrorMessages: false, // show detailed errors (default false)
}));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
