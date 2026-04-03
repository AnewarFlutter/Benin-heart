import { FaqRepository } from '../../domain/repositories/faq_repository';
import { FaqDataSource } from '../datasources/faq_data_source';
import { EntityFaq } from '../../domain/entities/entity_faq';

export class FaqRepositoryImpl implements FaqRepository {
  constructor(private readonly dataSource: FaqDataSource) {}

  async getFaqs(): Promise<EntityFaq[]> {
    return this.dataSource.getFaqs();
  }
}
