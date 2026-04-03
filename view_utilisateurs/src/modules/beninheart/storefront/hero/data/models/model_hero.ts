import { EntityHeroBanner } from '../../domain/entities/entity_hero';

export class ModelHeroBanner implements EntityHeroBanner {
  constructor(
    public readonly id: number,
    public readonly titre: string,
    public readonly description: string,
    public readonly image: string | null,
    public readonly boutonTexte: string | null,
    public readonly boutonLien: string | null,
    public readonly ordre: number,
  ) {}

  static fromJson(json: Record<string, unknown>): ModelHeroBanner {
    return new ModelHeroBanner(
      json['id'] as number,
      json['titre'] as string,
      json['description'] as string,
      (json['image'] as string | null) ?? null,
      (json['bouton_texte'] as string | null) ?? null,
      (json['bouton_lien'] as string | null) ?? null,
      json['ordre'] as number,
    );
  }

  toEntity(): EntityHeroBanner {
    return this;
  }
}
