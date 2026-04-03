import { EntityTemoignage } from '../entities/entity_temoignage';

export interface TemoignageRepository {
  getTemoignages(): Promise<EntityTemoignage[]>;
}
