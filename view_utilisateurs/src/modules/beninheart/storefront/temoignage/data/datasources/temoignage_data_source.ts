import { EntityTemoignage } from '../../domain/entities/entity_temoignage';

export interface TemoignageDataSource {
  getTemoignages(): Promise<EntityTemoignage[]>;
}
