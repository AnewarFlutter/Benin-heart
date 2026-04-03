import { EntityContactInfo, EntityContactInput } from '../../domain/entities/entity_contact';

export interface ContactDataSource {
  getContactInfo(): Promise<EntityContactInfo>;
  sendContact(input: EntityContactInput): Promise<void>;
}
