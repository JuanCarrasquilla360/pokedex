import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number
  private defaultOffset: number
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = this.configService.get<number>('defaultLimit')
    this.defaultOffset = this.configService.get<number>('defaultOffset')
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (err) {
      this.handleExceptions(err)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.defaultOffset } = paginationDto
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
  }

  async findOne(term: string) {
    let pokemon: Pokemon
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ number: term })
    }
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }
    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or number ${term} not found`)
    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term)
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase()
    }
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })
      return { ...pokemon.toJSON(), ...updatePokemonDto }
    } catch (err) {
      this.handleExceptions(err)
    }
  }

  async remove(id: string) {
    const res = await this.pokemonModel.deleteOne({ _id: id })
    if (res.deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`)
    }
  }

  handleExceptions(error) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exist in DB ${JSON.stringify(error.keyValue)}`)
    }
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  }
}
