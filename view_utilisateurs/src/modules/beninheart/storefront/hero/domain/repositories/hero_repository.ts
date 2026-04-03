import { EntityHeroBanner } from '../entities/entity_hero';

export interface HeroRepository {
  getHeroBanners(): Promise<EntityHeroBanner[]>;
}
