import { apiClient } from '@/lib/api/api_client';
import { API_ROUTES } from '@/shared/constants/api_routes';
import { TemoignageDataSource } from './temoignage_data_source';
import { EntityTemoignage } from '../../domain/entities/entity_temoignage';
import { ModelTemoignage } from '../models/model_temoignage';

export class RestApiTemoignageDataSourceImpl implements TemoignageDataSource {
  async getTemoignages(): Promise<EntityTemoignage[]> {
    const { data, error } = await apiClient<Record<string, unknown>[]>(
      API_ROUTES.STOREFRONT.TEMOIGNAGES,
      { method: 'GET' }
    );
    if (error || !data) return [];
    return data.map((item) => ModelTemoignage.fromJson(item).toEntity());
  }
}
