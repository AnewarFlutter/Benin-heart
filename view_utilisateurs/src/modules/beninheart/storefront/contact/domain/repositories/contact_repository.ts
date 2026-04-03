import { EntityContactInfo, EntityContactInput } from '../entities/entity_contact';

export interface ContactRepository {
  getContactInfo(): Promise<EntityContactInfo>;
  sendContact(input: EntityContactInput): Promise<void>;
}
