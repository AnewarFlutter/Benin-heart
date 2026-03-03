"""
Views for client user profile endpoints
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .serializers import (
    ClientProfileSerializer,
    ClientProfileUpdateSerializer,
    ClientChangePasswordSerializer
)
from .permissions import IsClientUser


class ClientProfileView(APIView):
    """
    API pour gérer le profil du client connecté.
    GET: Récupérer le profil
    PUT/PATCH: Mettre à jour le profil
    """
    permission_classes = [IsAuthenticated, IsClientUser]

    @extend_schema(
        tags=['CLIENT - Profil'],
        summary="Récupérer mon profil",
        description="Récupère les informations du profil du client connecté.",
        responses={200: ClientProfileSerializer}
    )
    def get(self, request):
        """Récupérer le profil du client connecté."""
        serializer = ClientProfileSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        tags=['CLIENT - Profil'],
        summary="Mettre à jour mon profil",
        description="Met à jour les informations du profil du client connecté (nom, prénom, date de naissance).",
        request=ClientProfileUpdateSerializer,
        responses={200: ClientProfileSerializer}
    )
    def put(self, request):
        """Mettre à jour le profil du client connecté."""
        serializer = ClientProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=False
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Retourner le profil complet mis à jour
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': ClientProfileSerializer(request.user).data
        })

    @extend_schema(
        tags=['CLIENT - Profil'],
        summary="Mettre à jour partiellement mon profil",
        description="Met à jour partiellement les informations du profil du client connecté.",
        request=ClientProfileUpdateSerializer,
        responses={200: ClientProfileSerializer}
    )
    def patch(self, request):
        """Mettre à jour partiellement le profil du client connecté."""
        serializer = ClientProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Retourner le profil complet mis à jour
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': ClientProfileSerializer(request.user).data
        })


class ClientChangePasswordView(APIView):
    """
    API pour changer le mot de passe du client connecté.
    """
    permission_classes = [IsAuthenticated, IsClientUser]

    @extend_schema(
        tags=['CLIENT - Profil'],
        summary="Changer mon mot de passe",
        description="Permet au client connecté de changer son mot de passe. "
                   "Nécessite l'ancien mot de passe et le nouveau mot de passe (avec confirmation).",
        request=ClientChangePasswordSerializer,
        responses={
            200: {'description': 'Mot de passe changé avec succès'},
            400: {'description': 'Erreur de validation'}
        }
    )
    def post(self, request):
        """Changer le mot de passe du client connecté."""
        serializer = ClientChangePasswordSerializer(
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
