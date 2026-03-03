"""
Repository implementations for Devis app
"""
from ..models import Devis
from ..domain.repositories import DevisRepository


class DjangoDevisRepository(DevisRepository):
    """Django ORM implementation of DevisRepository."""

    def get_by_id(self, id):
        return Devis.objects.get(id=id)

    def get_all(self):
        return Devis.objects.all()

    def create(self, data):
        return Devis.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
