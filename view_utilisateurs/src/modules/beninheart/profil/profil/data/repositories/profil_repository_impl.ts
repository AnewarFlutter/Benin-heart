
import { EntityMonProfil, EntityProfilPublic } from "../../domain/entities/entity_profil";
import { ProfilRepository } from "../../domain/repositories/profil_repository";
import { ProfilDataSource } from "../datasources/profil_data_source";

/**
 * ProfilRepositoryImpl implements ProfilRepository by delegating to ProfilDataSource.
 */
export class ProfilRepositoryImpl implements ProfilRepository {

    constructor(private readonly datasource: ProfilDataSource) {}

    async getProfils(): Promise<EntityProfilPublic[]> {
        try {
            const data = await this.datasource.getProfils();
            return data.map((m) => m.toEntity());
        } catch (e) {
            throw e;
        }
    }

    async getMonProfil(): Promise<EntityMonProfil | null> {
        try {
            const data = await this.datasource.getMonProfil();
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    async updateMonProfil(partial: Partial<EntityMonProfil>): Promise<EntityMonProfil | null> {
        try {
            const data = await this.datasource.updateMonProfil(partial);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    async uploadPhoto(formData: FormData): Promise<boolean> {
        try {
            return await this.datasource.uploadPhoto(formData);
        } catch (e) {
            throw e;
        }
    }

    async deletePhoto(uuid: string): Promise<boolean> {
        try {
            return await this.datasource.deletePhoto(uuid);
        } catch (e) {
            throw e;
        }
    }
}
