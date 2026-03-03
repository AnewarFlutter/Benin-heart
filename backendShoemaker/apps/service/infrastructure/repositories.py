"""
Repository implementations for Service app
"""
from ..models import Service
from ..domain.repositories import ServiceRepository


class DjangoServiceRepository(ServiceRepository):
    """Django ORM implementation of ServiceRepository."""

    def get_by_id(self, service_id):
        return Service.objects.get(id=service_id)

    def get_all(self):
        return Service.objects.all()

    def create(self, service_data):
        return Service.objects.create(**service_data)

    def update(self, service_id, service_data):
        service = self.get_by_id(service_id)
        for key, value in service_data.items():
            setattr(service, key, value)
        service.save()
        return service

    def delete(self, service_id):
        service = self.get_by_id(service_id)
        service.delete()
