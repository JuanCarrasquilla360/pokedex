import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfig],
      validationSchema: JoiValidationSchema
    }),
    MongooseModule.forRoot(process.env.MONGODB),
    PokemonModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','public')
    }),
    CommonModule,
    SeedModule,
  ],
})
export class AppModule {}
