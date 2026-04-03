import { ContactRepository } from '../../domain/repositories/contact_repository';
import { ContactDataSource } from '../datasources/contact_data_source';
import { EntityContactInfo, EntityContactInput } from '../../domain/entities/entity_contact';

export class ContactRepositoryImpl implements ContactRepository {
  constructor(private readonly dataSource: ContactDataSource) {}

  async getContactInfo(): Promise<EntityContactInfo> {
    return this.dataSource.getContactInfo();
  }

  async sendContact(input: EntityContactInput): Promise<void> {
    return this.dataSource.sendContact(input);
  }
}
