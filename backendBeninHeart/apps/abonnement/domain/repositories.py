"""
Repository interfaces for Abonnement app.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from .entities import PlanAbonnementEntity, SouscriptionEntity


class IPlanAbonnementRepository(ABC):

    @abstractmethod
    def get_actifs(self) -> List[PlanAbonnementEntity]:
        pass

    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[PlanAbonnementEntity]:
        pass

    @abstractmethod
    def get_by_id(self, id: int) -> Optional[PlanAbonnementEntity]:
        pass

    @abstractmethod
    def get_all(self) -> List[PlanAbonnementEntity]:
        pass


class ISouscriptionRepository(ABC):

    @abstractmethod
    def create(self, data: dict) -> SouscriptionEntity:
        pass

    @abstractmethod
    def get_active_for_user(self, user_id: int) -> Optional[SouscriptionEntity]:
        pass

    @abstractmethod
    def get_all_for_user(self, user_id: int) -> List[SouscriptionEntity]:
        pass

    @abstractmethod
    def get_all(self) -> List[SouscriptionEntity]:
        pass

    @abstractmethod
    def get_by_uuid(self, uuid: str) -> Optional[SouscriptionEntity]:
        pass

    @abstractmethod
    def update_statut(self, uuid: str, statut: str, notes: str = None) -> SouscriptionEntity:
        pass
