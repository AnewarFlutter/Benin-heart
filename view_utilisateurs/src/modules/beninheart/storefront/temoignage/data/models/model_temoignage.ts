import { EntityTemoignage } from '../../domain/entities/entity_temoignage';

export class ModelTemoignage implements EntityTemoignage {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly profession: string,
    public readonly description: string,
    public readonly photo: string | null,
    public readonly createdAt: string,
  ) {}

  static fromJson(json: Record<string, unknown>): ModelTemoignage {
    return new ModelTemoignage(
      json['id'] as string,
      json['name'] as string,
      (json['profession'] as string) ?? '',
      json['description'] as string,
      (json['photo'] as string | null) ?? null,
      json['created_at'] as string,
    );
  }

  toEntity(): EntityTemoignage {
    return this;
  }
}
