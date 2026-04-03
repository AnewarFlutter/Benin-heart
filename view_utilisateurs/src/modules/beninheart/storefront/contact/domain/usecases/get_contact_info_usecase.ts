import { ContactRepository } from '../repositories/contact_repository';
import { EntityContactInfo } from '../entities/entity_contact';

export class GetContactInfoUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(): Promise<EntityContactInfo> {
    return this.repository.getContactInfo();
  }
}
