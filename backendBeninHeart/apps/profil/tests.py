from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Profil

User = get_user_model()


class ProfilTests(TestCase):
    """Tests pour les endpoints de profil."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='alice@beninheart.com',
            email='alice@beninheart.com',
            password='TestPass123!',
            first_name='Alice',
            last_name='Dupont',
        )
        self.user2 = User.objects.create_user(
            username='bob@beninheart.com',
            email='bob@beninheart.com',
            password='TestPass123!',
            first_name='Bob',
            last_name='Martin',
        )
        # Créer les profils
        self.profil_alice = Profil.objects.create(
            user=self.user,
            prenom='Alice',
            date_naissance='1995-06-15',
            genre='F',
            recherche='H',
            bio='Amatrice de voyages',
            ville='Cotonou',
            pays='Bénin',
        )
        self.profil_bob = Profil.objects.create(
            user=self.user2,
            prenom='Bob',
            date_naissance='1992-03-20',
            genre='H',
            recherche='F',
            bio='Passionné de sport',
            ville='Porto-Novo',
            pays='Bénin',
        )

    def test_list_profils_requires_auth(self):
        """Lister les profils nécessite une authentification."""
        response = self.client.get('/api/client/profils/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_list_profils_authenticated(self):
        """Un utilisateur authentifié peut lister les profils (hors le sien)."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/client/profils/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Alice ne voit pas son propre profil
        uuids = [p['uuid'] for p in response.data]
        self.assertNotIn(str(self.profil_alice.uuid), uuids)

    def test_mon_profil_authenticated(self):
        """Un utilisateur peut accéder à son propre profil."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/client/mon-profil/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['prenom'], 'Alice')

    def test_mon_profil_requires_auth(self):
        """Accéder à son profil sans être connecté retourne 401."""
        response = self.client.get('/api/client/mon-profil/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_update_profil(self):
        """Un utilisateur peut mettre à jour son profil via PUT (partial=True)."""
        self.client.force_authenticate(user=self.user)
        response = self.client.put('/api/client/mon-profil/', {
            'bio': 'Nouvelle bio mise à jour',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profil_alice.refresh_from_db()
        self.assertEqual(self.profil_alice.bio, 'Nouvelle bio mise à jour')
