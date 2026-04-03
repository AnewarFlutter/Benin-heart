from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.profil.models import Profil
from .models import Like, Match

User = get_user_model()


class LikeTests(TestCase):
    """Tests pour les endpoints like/match."""

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

    def test_like_requires_auth(self):
        """Liker sans être connecté retourne 401."""
        response = self.client.post('/api/client/likes/', {
            'profil_uuid': str(self.profil_b.uuid),
            'type_action': 'LIKE',
        })
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_like_profil(self):
        """Alice peut liker Bob."""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post('/api/client/likes/', {
            'profil_uuid': str(self.profil_b.uuid),
            'type_action': 'LIKE',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('est_match', response.data)
        self.assertFalse(response.data['est_match'])  # Pas encore de match (Bob n'a pas liké)

    def test_mutual_like_creates_match(self):
        """Un like mutuel crée automatiquement un match."""
        # Alice like Bob
        self.client.force_authenticate(user=self.user_a)
        self.client.post('/api/client/likes/', {
            'profil_uuid': str(self.profil_b.uuid),
            'type_action': 'LIKE',
        })

        # Bob like Alice → déclenche le match
        self.client.force_authenticate(user=self.user_b)
        response = self.client.post('/api/client/likes/', {
            'profil_uuid': str(self.profil_a.uuid),
            'type_action': 'LIKE',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['est_match'])
        self.assertEqual(Match.objects.count(), 1)

    def test_dislike_does_not_create_match(self):
        """Un dislike ne crée pas de match même si l'autre a liké."""
        # Alice like Bob
        self.client.force_authenticate(user=self.user_a)
        self.client.post('/api/client/likes/', {
            'profil_uuid': str(self.profil_b.uuid),
            'type_action': 'LIKE',
        })
        # Bob dislike Alice
        self.client.force_authenticate(user=self.user_b)
        response = self.client.post('/api/client/likes/', {
            'profil_uuid': str(self.profil_a.uuid),
            'type_action': 'DISLIKE',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data['est_match'])
        self.assertEqual(Match.objects.count(), 0)

    def test_mes_matchs(self):
        """Un utilisateur peut lister ses matchs."""
        # Créer un match directement
        user1, user2 = sorted([self.user_a, self.user_b], key=lambda u: u.pk)
        Match.objects.create(user1=user1, user2=user2)

        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/client/mes-matchs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
