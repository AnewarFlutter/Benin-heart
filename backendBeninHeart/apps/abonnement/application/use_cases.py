"""
Use cases for Abonnement app.
"""
from django.core.exceptions import ValidationError
from .dtos import CreerSouscriptionDTO
from ..domain.repositories import IPlanAbonnementRepository, ISouscriptionRepository


class GetPlansActifsUseCase:
    def __init__(self, repo: IPlanAbonnementRepository):
        self.repo = repo

    def execute(self):
        return self.repo.get_actifs()


class GetPlanBySlugUseCase:
    def __init__(self, repo: IPlanAbonnementRepository):
        self.repo = repo

    def execute(self, slug: str):
        plan = self.repo.get_by_slug(slug)
        if not plan:
            raise ValidationError(f"Plan '{slug}' introuvable.")
        return plan


class CreerSouscriptionUseCase:
    def __init__(self, plan_repo: IPlanAbonnementRepository, souscription_repo: ISouscriptionRepository):
        self.plan_repo = plan_repo
        self.souscription_repo = souscription_repo

    def execute(self, dto: CreerSouscriptionDTO):
        plan = self.plan_repo.get_by_slug(dto.plan_slug)
        if not plan:
            raise ValidationError(f"Plan '{dto.plan_slug}' introuvable.")
        if not plan.est_actif:
            raise ValidationError("Ce plan n'est plus disponible.")

        data = {
            'user_id': dto.user_id,
            'plan_id': plan.id,
            'statut': 'EN_ATTENTE',
            'nombre_mois': dto.nombre_mois,
            'prenom': dto.prenom,
            'nom': dto.nom,
            'telephone': dto.telephone,
            'adresse': dto.adresse,
            'ville': dto.ville,
            'code_postal': dto.code_postal,
            'code_promo': dto.code_promo,
        }
        return self.souscription_repo.create(data)


class GetSouscriptionActiveUseCase:
    def __init__(self, repo: ISouscriptionRepository):
        self.repo = repo

    def execute(self, user_id: int):
        return self.repo.get_active_for_user(user_id)


class GetMesSouscriptionsUseCase:
    def __init__(self, repo: ISouscriptionRepository):
        self.repo = repo

    def execute(self, user_id: int):
        return self.repo.get_all_for_user(user_id)
