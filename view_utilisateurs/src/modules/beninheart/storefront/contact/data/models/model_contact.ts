import { EntityContactInfo } from '../../domain/entities/entity_contact';

export class ModelContactInfo implements EntityContactInfo {
  constructor(
    public readonly id: string,
    public readonly adresse: string,
    public readonly ville: string,
    public readonly pays: string,
    public readonly telephones: string[],
    public readonly emails: string[],
    public readonly horaires: string,
    public readonly urlSite: string,
  ) {}

  static fromJson(json: Record<string, unknown>): ModelContactInfo {
    return new ModelContactInfo(
      json['id'] as string,
      (json['adresse'] as string) ?? '',
      (json['ville'] as string) ?? '',
      (json['pays'] as string) ?? '',
      (json['telephones'] as string[]) ?? [],
      (json['emails'] as string[]) ?? [],
      (json['horaires'] as string) ?? '',
      (json['url_site'] as string) ?? '',
    );
  }

  toEntity(): EntityContactInfo {
    return this;
  }
}
