import { HeroRepository } from '../repositories/hero_repository';
import { EntityHeroBanner } from '../entities/entity_hero';

export class GetHeroBannersUseCase {
  constructor(private readonly repository: HeroRepository) {}

  async execute(): Promise<EntityHeroBanner[]> {
    return this.repository.getHeroBanners();
  }
}
