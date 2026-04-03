import { EntityFaq } from '../entities/entity_faq';

export interface FaqRepository {
  getFaqs(): Promise<EntityFaq[]>;
}
