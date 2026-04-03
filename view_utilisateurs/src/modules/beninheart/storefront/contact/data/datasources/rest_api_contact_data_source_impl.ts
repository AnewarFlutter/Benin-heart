import { apiClient } from '@/lib/api/api_client';
import { API_ROUTES } from '@/shared/constants/api_routes';
import { ContactDataSource } from './contact_data_source';
import { EntityContactInfo, EntityContactInput } from '../../domain/entities/entity_contact';
import { ModelContactInfo } from '../models/model_contact';

export class RestApiContactDataSourceImpl implements ContactDataSource {
  async getContactInfo(): Promise<EntityContactInfo> {
    const res = await apiClient<Record<string, unknown>>({
      endpoint: API_ROUTES.STOREFRONT.CONTACT_INFO,
      method: 'GET',
    });
    return ModelContactInfo.fromJson(res).toEntity();
  }

  async sendContact(input: EntityContactInput): Promise<void> {
    await apiClient<unknown>({
      endpoint: API_ROUTES.STOREFRONT.CONTACT,
      method: 'POST',
      body: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? '',
        sujet: input.sujet,
        message: input.message,
      },
    });
  }
}
