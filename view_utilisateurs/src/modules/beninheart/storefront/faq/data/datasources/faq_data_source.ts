import { EntityFaq } from '../../domain/entities/entity_faq';

export interface FaqDataSource {
  getFaqs(): Promise<EntityFaq[]>;
}
