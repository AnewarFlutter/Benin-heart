"""
Views for client abonnement endpoints.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from ...models import PlanAbonnement, Souscription
from .serializers import PlanAbonnementSerializer, CreerSouscriptionSerializer, SouscriptionSerializer


class PlansListView(APIView):
    """GET /api/client/plans/ — Liste des plans actifs (public)."""
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Client - Abonnements'],
        summary="Liste des plans d'abonnement",
        description="Retourne tous les plans actifs, triés par ordre d'affichage.",
        responses={200: PlanAbonnementSerializer(many=True)},
    )
    def get(self, request):
        plans = PlanAbonnement.objects.filter(est_actif=True).order_by('ordre', 'prix')
        serializer = PlanAbonnementSerializer(plans, many=True)
        return Response(serializer.data)


class PlanDetailView(APIView):
    """GET /api/client/plans/{slug}/ — Détail d'un plan (public)."""
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Client - Abonnements'],
        summary="Détail d'un plan d'abonnement",
        responses={200: PlanAbonnementSerializer, 404: None},
    )
    def get(self, request, slug):
        try:
            plan = PlanAbonnement.objects.get(slug=slug, est_actif=True)
        except PlanAbonnement.DoesNotExist:
            return Response({'detail': 'Plan introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PlanAbonnementSerializer(plan)
        return Response(serializer.data)


class CreerSouscriptionView(APIView):
    """POST /api/client/souscriptions/ — Soumettre une demande d'abonnement."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Abonnements'],
        summary="Soumettre une demande d'abonnement",
        description="Crée une souscription EN_ATTENTE. Un admin validera manuellement.",
        request=CreerSouscriptionSerializer,
        responses={201: SouscriptionSerializer},
    )
    def post(self, request):
        serializer = CreerSouscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        souscription = Souscription.objects.create(
            user=request.user,
            plan=serializer.validated_data['plan'],
            nombre_mois=serializer.validated_data['nombre_mois'],
            prenom=serializer.validated_data.get('prenom', ''),
            nom=serializer.validated_data.get('nom', ''),
            telephone=serializer.validated_data.get('telephone', ''),
            adresse=serializer.validated_data.get('adresse', ''),
            ville=serializer.validated_data.get('ville', ''),
            code_postal=serializer.validated_data.get('code_postal', ''),
            code_promo=serializer.validated_data.get('code_promo'),
            statut='EN_ATTENTE',
        )
        return Response(SouscriptionSerializer(souscription).data, status=status.HTTP_201_CREATED)


class MonAbonnementView(APIView):
    """GET /api/client/mon-abonnement/ — Abonnement actif de l'utilisateur connecté."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Abonnements'],
        summary="Mon abonnement actif",
        description="Retourne l'abonnement ACTIVE de l'utilisateur connecté, ou null.",
        responses={200: SouscriptionSerializer},
    )
    def get(self, request):
        souscription = (
            Souscription.objects.select_related('plan')
            .filter(user=request.user, statut='ACTIVE')
            .order_by('-date_debut')
            .first()
        )
        if not souscription:
            return Response({'abonnement': None})
        return Response(SouscriptionSerializer(souscription).data)
