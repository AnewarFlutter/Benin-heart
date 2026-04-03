import { TemoignageRepository } from '../../domain/repositories/temoignage_repository';
import { TemoignageDataSource } from '../datasources/temoignage_data_source';
import { EntityTemoignage } from '../../domain/entities/entity_temoignage';

export class TemoignageRepositoryImpl implements TemoignageRepository {
  constructor(private readonly dataSource: TemoignageDataSource) {}

  async getTemoignages(): Promise<EntityTemoignage[]> {
    return this.dataSource.getTemoignages();
  }
}
