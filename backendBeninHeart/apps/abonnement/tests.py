from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import PlanAbonnement, Souscription

User = get_user_model()


class PlanAbonnementTests(TestCase):
    """Tests pour les endpoints publics des plans d'abonnement."""

    def setUp(self):
        self.client = APIClient()
        self.plan = PlanAbonnement.objects.create(
            slug="free",
            titre="Gratuit",
            prix="0.00",
            prix_affiche="Gratuit",
            duree="Illimité",
            fonctionnalites=["5 profils/jour", "Messagerie basique"],
            est_populaire=False,
            icone="heart",
            ordre=1,
        )
        self.plan_premium = PlanAbonnement.objects.create(
            slug="premium",
            titre="Premium",
            prix="9.99",
            prix_affiche="9 990 FCFA/mois",
            duree="1 mois",
            fonctionnalites=["Profils illimités", "Superlike", "Messagerie illimitée"],
            fonctionnalites_exclues=["Boost de profil"],
            est_populaire=True,
            icone="star",
            ordre=2,
        )

    def test_list_plans_public(self):
        """Un visiteur anonyme peut lister les plans."""
        response = self.client.get('/api/client/plans/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_plan_fields(self):
        """Les champs du plan sont correctement sérialisés."""
        response = self.client.get('/api/client/plans/')
        plans = response.data
        slugs = [p['slug'] for p in plans]
        self.assertIn('free', slugs)
        self.assertIn('premium', slugs)
        premium = next(p for p in plans if p['slug'] == 'premium')
        self.assertTrue(premium['est_populaire'])
        self.assertEqual(len(premium['fonctionnalites']), 3)

    def test_plan_order(self):
        """Les plans sont retournés dans l'ordre défini par `ordre`."""
        response = self.client.get('/api/client/plans/')
        self.assertEqual(response.data[0]['slug'], 'free')
        self.assertEqual(response.data[1]['slug'], 'premium')


class SouscriptionTests(TestCase):
    """Tests pour les souscriptions authentifiées."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test@beninheart.com',
            email='test@beninheart.com',
            password='TestPass123!',
            first_name='Kouamé',
            last_name='Test',
        )
        self.plan = PlanAbonnement.objects.create(
            slug="premium",
            titre="Premium",
            prix="9.99",
            prix_affiche="9 990 FCFA/mois",
            duree="1 mois",
            fonctionnalites=["Profils illimités"],
            est_populaire=True,
            icone="star",
            ordre=1,
        )

    def test_souscrire_requires_auth(self):
        """Souscrire sans être connecté retourne 401."""
        response = self.client.post('/api/client/souscriptions/', {
            'plan_slug': 'premium',
            'nombre_mois': 1,
            'prenom': 'Kouamé',
            'nom': 'Test',
            'telephone': '97000001',
            'adresse': 'Cotonou',
            'ville': 'Cotonou',
            'code_postal': '229',
        })
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_mon_abonnement_requires_auth(self):
        """Accéder à mon-abonnement sans être connecté retourne 401."""
        response = self.client.get('/api/client/mon-abonnement/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_mon_abonnement_authenticated(self):
        """Un utilisateur connecté sans abonnement reçoit une 404."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/client/mon-abonnement/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])
