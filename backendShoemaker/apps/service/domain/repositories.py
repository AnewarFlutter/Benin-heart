"""
Repository interfaces for Service app
"""
from abc import ABC, abstractmethod


class ServiceRepository(ABC):
    """Service repository interface."""

    @abstractmethod
    def get_by_id(self, service_id):
        pass

    @abstractmethod
    def get_all(self):
        pass

    @abstractmethod
    def create(self, service_data):
        pass

    @abstractmethod
    def update(self, service_id, service_data):
        pass

    @abstractmethod
    def delete(self, service_id):
        pass
