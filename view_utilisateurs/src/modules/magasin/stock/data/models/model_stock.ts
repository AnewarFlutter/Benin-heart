import { EntityStock } from "../../domain/entities/entity_stock";

/**
 *  ModelStock represents the stock domain model implementing EntityStock.
 *  Offers helpers to construct from entities/JSON (single and list), serialize to JSON (with/without id),
 *  convert to entities (single and list), and clone via copyWith or fromPartialEntity.
 *  All properties are optional and may be null to support partial payloads across layers.
 */
export class ModelStock implements EntityStock {

    id?: string | null;
    sku?: string | null;
    name?: string | null;
    quantity?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    // Add other relevant fields here

    /**
     *  Creates a new ModelStock instance from an EntityStock object.
     *  @param data An EntityStock object with the stock data.
     */
    constructor(data: EntityStock) {
        Object.assign(this, data);
    }

    static fromEntity(entity: EntityStock): ModelStock {
        return new ModelStock({ ...entity });
    }

    toEntity(): EntityStock {
        return { ...this };
    }

    toJson(): Record<string, unknown> {
        return {
            id: this.id,
            sku: this.sku,
            name: this.name,
            quantity: this.quantity,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        };
    }

    toJsonWithoutId(): Record<string, unknown> {
        return {
            sku: this.sku,
            name: this.name,
            quantity: this.quantity,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        };
    }

    static fromJson(json: Record<string, unknown>): ModelStock {
        return new ModelStock({
            id: json.id != null ? String(json.id) : null,
            sku: json.sku as string | null,
            name: json.name as string | null,
            quantity: json.quantity as number | null,
            createdAt: json.created_at as string | null,
            updatedAt: json.updated_at as string | null,
        });
    }

    static fromJsonList(jsonList: Record<string, unknown>[]): ModelStock[] {
        return jsonList.map(json => ModelStock.fromJson(json));
    }

    static fromEntities(entities: EntityStock[]): ModelStock[] {
        return entities.map(ModelStock.fromEntity);
    }

    static toEntities(models: ModelStock[]): EntityStock[] {
        return models.map(model => model.toEntity());
    }

    copyWith(data: Partial<EntityStock>): ModelStock {
        return new ModelStock({
            ...this.toEntity(),
            ...data,
        });
    }

    public static fromPartialEntity(data: Partial<EntityStock>): ModelStock {
        return new ModelStock({
            ...this,
            ...data,
        });
    }
}
