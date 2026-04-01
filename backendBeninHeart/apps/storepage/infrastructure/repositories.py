"""
Repository implementations for Storepage app
"""
from ..models import Storepage
from ..domain.repositories import StorepageRepository


class DjangoStorepageRepository(StorepageRepository):
    """Django ORM implementation of StorepageRepository."""

    def get_by_id(self, id):
        return Storepage.objects.get(id=id)

    def get_all(self):
        return Storepage.objects.all()

    def create(self, data):
        return Storepage.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
