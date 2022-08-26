import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokemonResponse } from './interfaces/pokemon-response';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
    ) {
  }
  async excecuteSeed() {
    await this.pokemonModel.deleteMany()
    const data = await this.http.get<PokemonResponse>('https://pokeapi.co/api/v2/pokemon?limit=2000')
    const pokemonToInsert: {name: string, number: number}[] = []
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/')
      const number: number = +segments[segments.length - 2]
      pokemonToInsert.push({name, number})
    })
    await this.pokemonModel.insertMany(pokemonToInsert)
    return await this.pokemonModel.find()
  }
}
