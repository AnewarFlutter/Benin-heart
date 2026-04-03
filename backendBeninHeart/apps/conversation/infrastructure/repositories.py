"""
Repository implementations for Conversation app
"""
from ..models import Conversation
from ..domain.repositories import ConversationRepository


class DjangoConversationRepository(ConversationRepository):
    """Django ORM implementation of ConversationRepository."""

    def get_by_id(self, id):
        return Conversation.objects.get(id=id)

    def get_all(self):
        return Conversation.objects.all()

    def create(self, data):
        return Conversation.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
