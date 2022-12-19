import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });
  app.use(
    session({
      resave: false,
      name: 'ingl-monitor',
      saveUninitialized: false,
      secret: process.env.SECRET_KEY,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
