import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Discogs Collection API')
    .setDescription('An API to manage Discogs collections and wantlists')
    .setVersion('1.0')
    .addTag('releases', 'Release management operations')
    .addTag('collection', 'Collection and wantlist operations')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api`);
  console.log(
    `Discogs Username: ${configService.get<string>('app.discogs.username')}`,
  );
}

bootstrap();
