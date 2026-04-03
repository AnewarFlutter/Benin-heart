"""
Repository implementations for Abonnement app.
"""
from typing import List, Optional
from ..models import PlanAbonnement, Souscription
from ..domain.repositories import IPlanAbonnementRepository, ISouscriptionRepository
from ..domain.entities import PlanAbonnementEntity, SouscriptionEntity


def _plan_to_entity(obj: PlanAbonnement) -> PlanAbonnementEntity:
    return PlanAbonnementEntity(
        id=obj.pk,
        uuid=obj.uuid,
        slug=obj.slug,
        titre=obj.titre,
        description=obj.description,
        prix=obj.prix,
        prix_affiche=obj.prix_affiche,
        duree=obj.duree,
        fonctionnalites=obj.fonctionnalites,
        fonctionnalites_exclues=obj.fonctionnalites_exclues,
        est_populaire=obj.est_populaire,
        icone=obj.icone,
        ordre=obj.ordre,
        est_actif=obj.est_actif,
    )


def _souscription_to_entity(obj: Souscription) -> SouscriptionEntity:
    return SouscriptionEntity(
        id=obj.pk,
        uuid=obj.uuid,
        user_id=obj.user_id,
        plan_id=obj.plan_id,
        statut=obj.statut,
        date_debut=obj.date_debut,
        date_fin=obj.date_fin,
        nombre_mois=obj.nombre_mois,
        prenom=obj.prenom,
        nom=obj.nom,
        telephone=obj.telephone,
        adresse=obj.adresse,
        ville=obj.ville,
        code_postal=obj.code_postal,
        code_promo=obj.code_promo,
        notes=obj.notes,
    )


class DjangoPlanAbonnementRepository(IPlanAbonnementRepository):

    def get_actifs(self) -> List[PlanAbonnementEntity]:
        qs = PlanAbonnement.objects.filter(est_actif=True).order_by('ordre', 'prix')
        return [_plan_to_entity(p) for p in qs]

    def get_by_slug(self, slug: str) -> Optional[PlanAbonnementEntity]:
        try:
            return _plan_to_entity(PlanAbonnement.objects.get(slug=slug))
        except PlanAbonnement.DoesNotExist:
            return None

    def get_by_id(self, id: int) -> Optional[PlanAbonnementEntity]:
        try:
            return _plan_to_entity(PlanAbonnement.objects.get(pk=id))
        except PlanAbonnement.DoesNotExist:
            return None

    def get_all(self) -> List[PlanAbonnementEntity]:
        return [_plan_to_entity(p) for p in PlanAbonnement.objects.all().order_by('ordre')]


class DjangoSouscriptionRepository(ISouscriptionRepository):

    def create(self, data: dict) -> SouscriptionEntity:
        obj = Souscription.objects.create(**data)
        return _souscription_to_entity(obj)

    def get_active_for_user(self, user_id: int) -> Optional[SouscriptionEntity]:
        try:
            obj = Souscription.objects.select_related('plan').get(
                user_id=user_id, statut='ACTIVE'
            )
            return _souscription_to_entity(obj)
        except Souscription.DoesNotExist:
            return None

    def get_all_for_user(self, user_id: int) -> List[SouscriptionEntity]:
        qs = Souscription.objects.filter(user_id=user_id).order_by('-created_at')
        return [_souscription_to_entity(s) for s in qs]

    def get_all(self) -> List[SouscriptionEntity]:
        qs = Souscription.objects.select_related('user', 'plan').order_by('-created_at')
        return [_souscription_to_entity(s) for s in qs]

    def get_by_uuid(self, uuid: str) -> Optional[SouscriptionEntity]:
        try:
            return _souscription_to_entity(Souscription.objects.get(uuid=uuid))
        except Souscription.DoesNotExist:
            return None

    def update_statut(self, uuid: str, statut: str, notes: str = None) -> SouscriptionEntity:
        obj = Souscription.objects.get(uuid=uuid)
        obj.statut = statut
        if notes is not None:
            obj.notes = notes
        obj.save(update_fields=['statut', 'notes', 'updated_at'])
        return _souscription_to_entity(obj)
