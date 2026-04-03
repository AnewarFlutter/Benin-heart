import { EntityHeroBanner } from '../../domain/entities/entity_hero';

export interface HeroDataSource {
  getHeroBanners(): Promise<EntityHeroBanner[]>;
}
