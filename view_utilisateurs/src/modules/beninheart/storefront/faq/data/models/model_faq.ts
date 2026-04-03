import { EntityFaq } from '../../domain/entities/entity_faq';

export class ModelFaq implements EntityFaq {
  constructor(
    public readonly id: string,
    public readonly question: string,
    public readonly answer: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  static fromJson(json: Record<string, unknown>): ModelFaq {
    return new ModelFaq(
      json['id'] as string,
      json['question'] as string,
      json['answer'] as string,
      json['created_at'] as string,
      json['updated_at'] as string,
    );
  }

  toEntity(): EntityFaq {
    return this;
  }
}
