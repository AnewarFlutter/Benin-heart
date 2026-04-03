import { apiClient } from '@/lib/api/api_client';
import { API_ROUTES } from '@/shared/constants/api_routes';
import { TemoignageDataSource } from './temoignage_data_source';
import { EntityTemoignage } from '../../domain/entities/entity_temoignage';
import { ModelTemoignage } from '../models/model_temoignage';

export class RestApiTemoignageDataSourceImpl implements TemoignageDataSource {
  async getTemoignages(): Promise<EntityTemoignage[]> {
    const res = await apiClient<Record<string, unknown>[]>({
      endpoint: API_ROUTES.STOREFRONT.TEMOIGNAGES,
      method: 'GET',
    });
    return res.map((item) => ModelTemoignage.fromJson(item).toEntity());
  }
}
