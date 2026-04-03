import { apiClient } from '@/lib/api/api_client';
import { API_ROUTES } from '@/shared/constants/api_routes';
import { HeroDataSource } from './hero_data_source';
import { EntityHeroBanner } from '../../domain/entities/entity_hero';
import { ModelHeroBanner } from '../models/model_hero';

export class RestApiHeroDataSourceImpl implements HeroDataSource {
  async getHeroBanners(): Promise<EntityHeroBanner[]> {
    const res = await apiClient<Record<string, unknown>[]>({
      endpoint: API_ROUTES.STOREFRONT.HERO_BANNERS,
      method: 'GET',
    });
    return res.map((item) => ModelHeroBanner.fromJson(item).toEntity());
  }
}
