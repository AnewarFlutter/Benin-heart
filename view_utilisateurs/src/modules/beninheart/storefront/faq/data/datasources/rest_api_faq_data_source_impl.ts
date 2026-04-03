import { apiClient } from '@/lib/api/api_client';
import { API_ROUTES } from '@/shared/constants/api_routes';
import { FaqDataSource } from './faq_data_source';
import { EntityFaq } from '../../domain/entities/entity_faq';
import { ModelFaq } from '../models/model_faq';

export class RestApiFaqDataSourceImpl implements FaqDataSource {
  async getFaqs(): Promise<EntityFaq[]> {
    const res = await apiClient<Record<string, unknown>[]>({
      endpoint: API_ROUTES.STOREFRONT.FAQ,
      method: 'GET',
    });
    return res.map((item) => ModelFaq.fromJson(item).toEntity());
  }
}
