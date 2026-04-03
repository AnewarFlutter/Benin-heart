import { FaqRepository } from '../repositories/faq_repository';
import { EntityFaq } from '../entities/entity_faq';

export class GetFaqsUseCase {
  constructor(private readonly repository: FaqRepository) {}

  async execute(): Promise<EntityFaq[]> {
    return this.repository.getFaqs();
  }
}
