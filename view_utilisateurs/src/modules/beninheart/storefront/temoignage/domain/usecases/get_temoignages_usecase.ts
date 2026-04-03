import { TemoignageRepository } from '../repositories/temoignage_repository';
import { EntityTemoignage } from '../entities/entity_temoignage';

export class GetTemoignagesUseCase {
  constructor(private readonly repository: TemoignageRepository) {}

  async execute(): Promise<EntityTemoignage[]> {
    return this.repository.getTemoignages();
  }
}
