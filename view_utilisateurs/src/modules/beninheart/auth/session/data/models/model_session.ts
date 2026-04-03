
import { EntityPendingRegistration, EntitySession, EntityUser } from "../../domain/entities/entity_session";

/**
 * ModelSession is the data model for an authenticated session.
 */
export class ModelSession implements EntitySession {
    accessToken?: string | null;
    refreshToken?: string | null;
    user?: EntityUser | null;

    constructor(data: EntitySession) {
        Object.assign(this, data);
    }

    toEntity(): EntitySession {
        return { ...this };
    }

    static fromLoginJson(json: Record<string, unknown>): ModelSession {
        return new ModelSession({
            accessToken: json.access as string ?? null,
            refreshToken: json.refresh as string ?? null,
            user: null,
        });
    }

    static fromOTPJson(json: Record<string, unknown>): ModelSession {
        return new ModelSession({
            accessToken: json.access as string ?? null,
            refreshToken: json.refresh as string ?? null,
            user: null,
        });
    }
}

/**
 * ModelPendingRegistration is returned after register (before OTP).
 */
export class ModelPendingRegistration implements EntityPendingRegistration {
    id?: string | null;
    email?: string | null;

    constructor(data: EntityPendingRegistration) {
        Object.assign(this, data);
    }

    toEntity(): EntityPendingRegistration {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelPendingRegistration {
        return new ModelPendingRegistration({
            id: json.id != null ? String(json.id) : null,
            email: json.email as string ?? null,
        });
    }
}
