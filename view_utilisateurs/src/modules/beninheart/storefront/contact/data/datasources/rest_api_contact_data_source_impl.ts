import { apiClient } from '@/lib/api/api_client';
import { API_ROUTES } from '@/shared/constants/api_routes';
import { ContactDataSource } from './contact_data_source';
import { EntityContactInfo, EntityContactInput } from '../../domain/entities/entity_contact';
import { ModelContactInfo } from '../models/model_contact';

export class RestApiContactDataSourceImpl implements ContactDataSource {
  async getContactInfo(): Promise<EntityContactInfo> {
    const { data, error } = await apiClient<Record<string, unknown>>(
      API_ROUTES.STOREFRONT.CONTACT_INFO,
      { method: 'GET' }
    );
    if (error || !data) throw new Error('Infos contact indisponibles');
    return ModelContactInfo.fromJson(data).toEntity();
  }

  async sendContact(input: EntityContactInput): Promise<void> {
    const { error } = await apiClient<unknown>(
      API_ROUTES.STOREFRONT.CONTACT,
      {
        method: 'POST',
        body: {
          name: input.name,
          email: input.email,
          phone: input.phone ?? '',
          sujet: input.sujet,
          message: input.message,
        },
      }
    );
    if (error) throw new Error(error);
  }
}
