"""
Repository implementations for Commande app
"""
from ..models import Commande
from ..domain.repositories import CommandeRepository


class DjangoCommandeRepository(CommandeRepository):
    """Django ORM implementation of CommandeRepository."""

    def get_by_id(self, id):
        return Commande.objects.get(id=id)

    def get_all(self):
        return Commande.objects.all()

    def create(self, data):
        return Commande.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
