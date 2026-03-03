"""
Views for delivery user profile endpoints
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .serializers import (
    DeliveryProfileSerializer,
    DeliveryProfileUpdateSerializer,
    DeliveryChangePasswordSerializer,
    DeliveryAvailabilitySerializer,
    DeliveryAvailabilityResponseSerializer
)
from .permissions import IsDeliveryPerson
from apps.users.models import DeliveryPerson


class DeliveryProfileView(APIView):
    """
    API pour gérer le profil du livreur connecté.
    GET: Récupérer le profil
    PUT/PATCH: Mettre à jour le profil
    """
    permission_classes = [IsAuthenticated, IsDeliveryPerson]

    @extend_schema(
        tags=['DELIVERY - Profil'],
        summary="Récupérer mon profil",
        description="Récupère les informations du profil du livreur connecté.",
        responses={200: DeliveryProfileSerializer}
    )
    def get(self, request):
        """Récupérer le profil du livreur connecté."""
        serializer = DeliveryProfileSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        tags=['DELIVERY - Profil'],
        summary="Mettre à jour mon profil",
        description="Met à jour les informations du profil du livreur connecté (nom, prénom, date de naissance).",
        request=DeliveryProfileUpdateSerializer,
        responses={200: DeliveryProfileSerializer}
    )
    def put(self, request):
        """Mettre à jour le profil du livreur connecté."""
        serializer = DeliveryProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=False
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Retourner le profil complet mis à jour
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': DeliveryProfileSerializer(request.user).data
        })

    @extend_schema(
        tags=['DELIVERY - Profil'],
        summary="Mettre à jour partiellement mon profil",
        description="Met à jour partiellement les informations du profil du livreur connecté.",
        request=DeliveryProfileUpdateSerializer,
        responses={200: DeliveryProfileSerializer}
    )
    def patch(self, request):
        """Mettre à jour partiellement le profil du livreur connecté."""
        serializer = DeliveryProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Retourner le profil complet mis à jour
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': DeliveryProfileSerializer(request.user).data
        })


class DeliveryChangePasswordView(APIView):
    """
    API pour changer le mot de passe du livreur connecté.
    """
    permission_classes = [IsAuthenticated, IsDeliveryPerson]

    @extend_schema(
        tags=['DELIVERY - Profil'],
        summary="Changer mon mot de passe",
        description="Permet au livreur connecté de changer son mot de passe. "
                   "Nécessite l'ancien mot de passe et le nouveau mot de passe (avec confirmation).",
        request=DeliveryChangePasswordSerializer,
        responses={
            200: {'description': 'Mot de passe changé avec succès'},
            400: {'description': 'Erreur de validation'}
        }
    )
    def post(self, request):
        """Changer le mot de passe du livreur connecté."""
        serializer = DeliveryChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        # Changer le mot de passe
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({
            'message': 'Mot de passe changé avec succès'
        })


class DeliveryAvailabilityView(APIView):
    """
    API pour gérer le statut de disponibilité du livreur connecté.
    GET: Récupérer le statut actuel
    PUT: Changer le statut de disponibilité
    """
    permission_classes = [IsAuthenticated, IsDeliveryPerson]

    @extend_schema(
        tags=['DELIVERY - Disponibilité'],
        summary="Récupérer mon statut de disponibilité",
        description="Récupère le statut de disponibilité actuel du livreur connecté.",
        responses={
            200: DeliveryAvailabilityResponseSerializer,
            404: {'description': 'Profil livreur non trouvé'}
        }
    )
    def get(self, request):
        """Récupérer le statut de disponibilité du livreur connecté."""
        try:
            delivery_person = DeliveryPerson.objects.get(user=request.user)
            return Response({
                'is_available': delivery_person.is_available
            })
        except DeliveryPerson.DoesNotExist:
            return Response(
                {'error': 'Profil livreur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        tags=['DELIVERY - Disponibilité'],
        summary="Changer mon statut de disponibilité",
        description="Permet au livreur connecté de changer son statut de disponibilité (disponible/indisponible).",
        request=DeliveryAvailabilitySerializer,
        responses={
            200: DeliveryAvailabilityResponseSerializer,
            400: {'description': 'Erreur de validation'},
            404: {'description': 'Profil livreur non trouvé'}
        }
    )
    def put(self, request):
        """Changer le statut de disponibilité du livreur connecté."""
        serializer = DeliveryAvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            delivery_person = DeliveryPerson.objects.get(user=request.user)
            delivery_person.is_available = serializer.validated_data['is_available']
            delivery_person.save()

            status_text = "disponible" if delivery_person.is_available else "indisponible"
            return Response({
                'message': f'Statut mis à jour: vous êtes maintenant {status_text}',
                'is_available': delivery_person.is_available
            })
        except DeliveryPerson.DoesNotExist:
            return Response(
                {'error': 'Profil livreur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
