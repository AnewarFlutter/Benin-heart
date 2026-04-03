"""
Data Transfer Objects for Abonnement app.
"""
from dataclasses import dataclass
from typing import Optional
from datetime import date


@dataclass
class CreerSouscriptionDTO:
    user_id: int
    plan_slug: str
    nombre_mois: int
    prenom: str
    nom: str
    telephone: str
    adresse: str
    ville: str
    code_postal: str
    code_promo: Optional[str] = None
