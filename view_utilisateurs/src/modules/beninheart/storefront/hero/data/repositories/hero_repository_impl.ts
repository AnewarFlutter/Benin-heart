import { HeroRepository } from '../../domain/repositories/hero_repository';
import { HeroDataSource } from '../datasources/hero_data_source';
import { EntityHeroBanner } from '../../domain/entities/entity_hero';

export class HeroRepositoryImpl implements HeroRepository {
  constructor(private readonly dataSource: HeroDataSource) {}

  async getHeroBanners(): Promise<EntityHeroBanner[]> {
    return this.dataSource.getHeroBanners();
  }
}
