import { GetHeroBannersUseCase } from '@/modules/beninheart/storefront/hero/domain/usecases/get_hero_banners_usecase';
import { GetTemoignagesUseCase } from '@/modules/beninheart/storefront/temoignage/domain/usecases/get_temoignages_usecase';
import { GetFaqsUseCase } from '@/modules/beninheart/storefront/faq/domain/usecases/get_faqs_usecase';
import { GetContactInfoUseCase } from '@/modules/beninheart/storefront/contact/domain/usecases/get_contact_info_usecase';
import { SendContactUseCase } from '@/modules/beninheart/storefront/contact/domain/usecases/send_contact_usecase';
import { EntityHeroBanner } from '@/modules/beninheart/storefront/hero/domain/entities/entity_hero';
import { EntityTemoignage } from '@/modules/beninheart/storefront/temoignage/domain/entities/entity_temoignage';
import { EntityFaq } from '@/modules/beninheart/storefront/faq/domain/entities/entity_faq';
import { EntityContactInfo, EntityContactInput } from '@/modules/beninheart/storefront/contact/domain/entities/entity_contact';

export class StorefrontController {
  constructor(
    private readonly getHeroBannersUseCase: GetHeroBannersUseCase,
    private readonly getTemoignagesUseCase: GetTemoignagesUseCase,
    private readonly getFaqsUseCase: GetFaqsUseCase,
    private readonly getContactInfoUseCase: GetContactInfoUseCase,
    private readonly sendContactUseCase: SendContactUseCase,
  ) {}

  async getHeroBanners(): Promise<EntityHeroBanner[]> {
    return this.getHeroBannersUseCase.execute();
  }

  async getTemoignages(): Promise<EntityTemoignage[]> {
    return this.getTemoignagesUseCase.execute();
  }

  async getFaqs(): Promise<EntityFaq[]> {
    return this.getFaqsUseCase.execute();
  }

  async getContactInfo(): Promise<EntityContactInfo> {
    return this.getContactInfoUseCase.execute();
  }

  async sendContact(input: EntityContactInput): Promise<void> {
    return this.sendContactUseCase.execute(input);
  }
}
