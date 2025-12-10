
import { EntityUser } from "../../domain/entities/entity_user";

/**
 *  ModelUser represents the user domain model implementing EntityUser.
 *  Offers helpers to construct from entities/JSON (single and list), serialize to JSON (with/without id),
 *  convert to entities (single and list), and clone via copyWith or fromPartialEntity.
 *  All properties are optional and may be null to support partial payloads across layers.
 */
export class ModelUser implements EntityUser {

    id?: string | null;
    username?: string | null;
    email?: string | null;
    isActive?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    // Add other relevant fields here

    /**
     *  Creates a new ModelUser instance from an EntityUser object.
     *  @param data An EntityUser object with the users data.
     */
    constructor(data: EntityUser) {
        Object.assign(this, data);
    }

    static fromEntity(entity: EntityUser): ModelUser {
        return new ModelUser({ ...entity });
    }

    toEntity(): EntityUser {
        return { ...this };
    }

    toJson(): Record<string, unknown> {
        return { 
            id: this.id,
            username: this.username,
            email: this.email,
            is_active: this.isActive,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        };
    }

    toJsonWithoutId(): Record<string, unknown> {
        return {
            username: this.username,
            email: this.email,
            is_active: this.isActive,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        };
    }

    static fromJson(json: Record<string, unknown>): ModelUser {
        return new ModelUser({
            id: json.id != null ? String(json.id) : null,
            username: json.username as string | null,
            email: json.email as string | null,
            isActive: json.is_active as boolean | null,
            createdAt: json.created_at as string | null,
            updatedAt: json.updated_at as string | null,
        });
    }

    static fromJsonList(jsonList: Record<string, unknown>[]): ModelUser[] {
        return jsonList.map(json => ModelUser.fromJson(json));
    }

    static fromEntities(entities: EntityUser[]): ModelUser[] {
        return entities.map(ModelUser.fromEntity);
    }

    static toEntities(models: ModelUser[]): EntityUser[] {
        return models.map(model => model.toEntity());
    }

    copyWith(data: Partial<EntityUser>): ModelUser {
        return new ModelUser({
            ...this.toEntity(),
            ...data,
        });
    }

    public static fromPartialEntity(data: Partial<EntityUser>): ModelUser {
        return new ModelUser({
            ...this,
            ...data,
        });
    }
}
