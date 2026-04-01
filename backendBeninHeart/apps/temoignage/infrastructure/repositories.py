"""
Repository implementations for Temoignage app
"""
from ..models import Temoignage
from ..domain.repositories import TemoignageRepository


class DjangoTemoignageRepository(TemoignageRepository):
    """Django ORM implementation of TemoignageRepository."""

    def get_by_id(self, id):
        return Temoignage.objects.get(id=id)

    def get_all(self):
        return Temoignage.objects.all()

    def create(self, data):
        return Temoignage.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
