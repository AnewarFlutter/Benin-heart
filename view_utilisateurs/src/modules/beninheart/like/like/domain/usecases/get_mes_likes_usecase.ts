import { LikeRepository } from '../repositories/like_repository';
import { EntityMatch } from '../entities/entity_like';

export class GetMesLikesUseCase {
  constructor(private readonly repository: LikeRepository) {}

  async execute(): Promise<EntityMatch[]> {
    return this.repository.getMesLikes();
  }
}
