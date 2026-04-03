"""
Domain entities for Abonnement app.
"""
from dataclasses import dataclass, field
from typing import List, Optional
from decimal import Decimal
import uuid
from datetime import date


@dataclass
class PlanAbonnementEntity:
    titre: str
    slug: str
    description: str
    prix: Decimal
    prix_affiche: str
    duree: str
    fonctionnalites: List[str]
    fonctionnalites_exclues: List[str]
    icone: str
    ordre: int
    est_populaire: bool = False
    est_actif: bool = True
    id: Optional[int] = None
    uuid: Optional[uuid.UUID] = None


@dataclass
class SouscriptionEntity:
    user_id: int
    plan_id: int
    statut: str
    nombre_mois: int
    prenom: str = ''
    nom: str = ''
    telephone: str = ''
    adresse: str = ''
    ville: str = ''
    code_postal: str = ''
    code_promo: Optional[str] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    notes: Optional[str] = None
    id: Optional[int] = None
    uuid: Optional[uuid.UUID] = None

    @property
    def est_active(self) -> bool:
        return self.statut == 'ACTIVE'
