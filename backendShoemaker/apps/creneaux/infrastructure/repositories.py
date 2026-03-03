"""
Repository implementations for Creneaux app
"""
from ..models import Creneaux
from ..domain.repositories import CreneauxRepository


class DjangoCreneauxRepository(CreneauxRepository):
    """Django ORM implementation of CreneauxRepository."""

    def get_by_id(self, id):
        return Creneaux.objects.get(id=id)

    def get_all(self):
        return Creneaux.objects.all()

    def create(self, data):
        return Creneaux.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
