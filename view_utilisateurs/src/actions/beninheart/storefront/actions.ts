'use server';

import { featuresDi } from '@/di/features_di';
import { AppActionResult } from '@/shared/types/global';
import { EntityHeroBanner } from '@/modules/beninheart/storefront/hero/domain/entities/entity_hero';
import { EntityTemoignage } from '@/modules/beninheart/storefront/temoignage/domain/entities/entity_temoignage';
import { EntityFaq } from '@/modules/beninheart/storefront/faq/domain/entities/entity_faq';
import { EntityContactInfo, EntityContactInput } from '@/modules/beninheart/storefront/contact/domain/entities/entity_contact';

export async function getHeroBannersAction(): Promise<AppActionResult<EntityHeroBanner[]>> {
  try {
    const data = await featuresDi.storefrontController.getHeroBanners();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur chargement bannières' };
  }
}

export async function getTemoignagesAction(): Promise<AppActionResult<EntityTemoignage[]>> {
  try {
    const data = await featuresDi.storefrontController.getTemoignages();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur chargement témoignages' };
  }
}

export async function getFaqsAction(): Promise<AppActionResult<EntityFaq[]>> {
  try {
    const data = await featuresDi.storefrontController.getFaqs();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur chargement FAQ' };
  }
}

export async function getContactInfoAction(): Promise<AppActionResult<EntityContactInfo>> {
  try {
    const data = await featuresDi.storefrontController.getContactInfo();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur chargement infos contact' };
  }
}

export async function sendContactAction(input: EntityContactInput): Promise<AppActionResult<void>> {
  try {
    await featuresDi.storefrontController.sendContact(input);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur envoi message' };
  }
}
