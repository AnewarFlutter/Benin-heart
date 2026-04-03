"""
Repository implementations for Profil app
"""
from ..models import Profil
from ..domain.repositories import ProfilRepository


class DjangoProfilRepository(ProfilRepository):
    """Django ORM implementation of ProfilRepository."""

    def get_by_id(self, id):
        return Profil.objects.get(id=id)

    def get_all(self):
        return Profil.objects.all()

    def create(self, data):
        return Profil.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
