"""
Repository implementations for Like app
"""
from ..models import Like
from ..domain.repositories import LikeRepository


class DjangoLikeRepository(LikeRepository):
    """Django ORM implementation of LikeRepository."""

    def get_by_id(self, id):
        return Like.objects.get(id=id)

    def get_all(self):
        return Like.objects.all()

    def create(self, data):
        return Like.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
