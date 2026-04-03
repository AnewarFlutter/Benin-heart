import { ContactRepository } from '../repositories/contact_repository';
import { EntityContactInput } from '../entities/entity_contact';

export class SendContactUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(input: EntityContactInput): Promise<void> {
    return this.repository.sendContact(input);
  }
}
