from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.profil.models import Profil
from apps.like.models import Match
from .models import Conversation, Message

User = get_user_model()


class ConversationTests(TestCase):
    """Tests pour les endpoints de conversation/messagerie."""

    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(
            username='alice@beninheart.com', email='alice@beninheart.com',
            password='Pass123!', first_name='Alice', last_name='A',
        )
        self.user_b = User.objects.create_user(
            username='bob@beninheart.com', email='bob@beninheart.com',
            password='Pass123!', first_name='Bob', last_name='B',
        )
        self.profil_a = Profil.objects.create(
            user=self.user_a, prenom='Alice', date_naissance='1995-01-01',
            genre='F', recherche='H', ville='Cotonou', pays='Bénin',
        )
        self.profil_b = Profil.objects.create(
            user=self.user_b, prenom='Bob', date_naissance='1993-05-10',
            genre='H', recherche='F', ville='Cotonou', pays='Bénin',
        )
        # Créer un match
        user1, user2 = sorted([self.user_a, self.user_b], key=lambda u: u.pk)
        self.match = Match.objects.create(user1=user1, user2=user2)
        # Créer une conversation liée au match
        self.conversation = Conversation.objects.create(
            match=self.match,
            participant1=user1,
            participant2=user2,
        )

    def test_list_conversations_requires_auth(self):
        """Lister les conversations nécessite une auth."""
        response = self.client.get('/api/client/conversations/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_list_conversations_authenticated(self):
        """Alice voit ses conversations."""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/client/conversations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('uuid', response.data[0])
        self.assertIn('autre_prenom', response.data[0])

    def test_get_messages_authenticated(self):
        """Alice peut récupérer les messages d'une conversation."""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(f'/api/client/conversations/{self.conversation.uuid}/messages/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)  # Pas encore de messages

    def test_get_messages_other_user_forbidden(self):
        """Un utilisateur sans rapport avec la conversation ne peut pas voir les messages."""
        user_c = User.objects.create_user(
            username='carol@beninheart.com', email='carol@beninheart.com',
            password='Pass123!', first_name='Carol', last_name='C',
        )
        self.client.force_authenticate(user=user_c)
        response = self.client.get(f'/api/client/conversations/{self.conversation.uuid}/messages/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
