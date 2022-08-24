import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
    PokemonModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','public')
    }),
    CommonModule,
    SeedModule,
  ],
})
export class AppModule {}
