"""
Repository interfaces for Commande app
"""
from abc import ABC, abstractmethod


class CommandeRepository(ABC):
    """Commande repository interface."""

    @abstractmethod
    def get_by_id(self, id):
        pass

    @abstractmethod
    def get_all(self):
        pass

    @abstractmethod
    def create(self, data):
        pass

    @abstractmethod
    def update(self, id, data):
        pass

    @abstractmethod
    def delete(self, id):
        pass
