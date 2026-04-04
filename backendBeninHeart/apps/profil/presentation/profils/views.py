"""
Views for client profil endpoints.
"""
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from drf_spectacular.utils import extend_schema

from ...models import Profil, PhotoProfil
from .serializers import (
    ProfilPublicSerializer,
    MonProfilSerializer,
    CreerProfilSerializer,
    UploadPhotoSerializer,
    PhotoProfilSerializer,
)


class MonProfilView(APIView):
    """
    GET  /api/client/mon-profil/ — Récupérer mon profil
    POST /api/client/mon-profil/ — Créer mon profil
    PUT  /api/client/mon-profil/ — Modifier mon profil
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]

    @extend_schema(
        tags=['Client - Profil'],
        summary="Récupérer mon profil",
        responses={200: MonProfilSerializer, 404: None},
    )
    def get(self, request):
        try:
            profil = request.user.profil
        except Profil.DoesNotExist:
            return Response({'detail': 'Profil non créé.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(MonProfilSerializer(profil).data)

    @extend_schema(
        tags=['Client - Profil'],
        summary="Créer mon profil",
        request=CreerProfilSerializer,
        responses={201: MonProfilSerializer},
    )
    def post(self, request):
        if hasattr(request.user, 'profil'):
            return Response(
                {'detail': 'Vous avez déjà un profil. Utilisez PUT pour le modifier.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CreerProfilSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profil = serializer.save(user=request.user)
        return Response(MonProfilSerializer(profil).data, status=status.HTTP_201_CREATED)

    @extend_schema(
        tags=['Client - Profil'],
        summary="Modifier mon profil",
        request=CreerProfilSerializer,
        responses={200: MonProfilSerializer},
    )
    def put(self, request):
        try:
            profil = request.user.profil
            # Profil existant → mise à jour
            serializer = CreerProfilSerializer(profil, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            profil = serializer.save()
            return Response(MonProfilSerializer(profil).data)
        except Profil.DoesNotExist:
            # Profil inexistant → création (upsert)
            serializer = CreerProfilSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            profil = serializer.save(user=request.user)
            return Response(MonProfilSerializer(profil).data, status=status.HTTP_201_CREATED)


class ProfilsListView(APIView):
    """
    GET /api/client/profils/ — Liste des profils pour le swipe (paginée, filtrée).
    Retourne les profils actifs compatibles avec les préférences de l'utilisateur.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Profil'],
        summary="Profils pour le swipe",
        description="Retourne les profils compatibles (genre, âge). Exclut les profils déjà likés/dislikés.",
        responses={200: ProfilPublicSerializer(many=True)},
    )
    def get(self, request):
        try:
            mon_profil = request.user.profil
        except Profil.DoesNotExist:
            return Response({'detail': 'Créez votre profil pour accéder aux suggestions.'}, status=status.HTTP_400_BAD_REQUEST)

        # Profils compatibles avec les préférences
        qs = Profil.objects.filter(statut='ACTIF').exclude(user=request.user)

        # Filtre genre
        if mon_profil.recherche != 'TOUS':
            qs = qs.filter(genre=mon_profil.recherche)

        # Exclure les profils déjà likés/dislikés (sera connecté après création app like)
        try:
            from apps.like.models import Like
            deja_evalues = Like.objects.filter(
                expediteur=request.user
            ).values_list('destinataire_id', flat=True)
            qs = qs.exclude(user_id__in=deja_evalues)
        except ImportError:
            pass

        qs = qs.select_related('user').prefetch_related('photos').order_by('-est_en_ligne', '-derniere_activite')[:20]
        serializer = ProfilPublicSerializer(qs, many=True)
        return Response(serializer.data)


class ProfilDetailView(APIView):
    """GET /api/client/profils/{uuid}/ — Voir le profil d'un membre."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Profil'],
        summary="Voir le profil d'un membre",
        responses={200: ProfilPublicSerializer, 404: None},
    )
    def get(self, request, uuid):
        try:
            profil = Profil.objects.prefetch_related('photos').get(uuid=uuid, statut='ACTIF')
        except Profil.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProfilPublicSerializer(profil).data)


class UploadPhotoView(APIView):
    """
    POST   /api/client/mon-profil/photos/ — Ajouter une photo
    DELETE /api/client/mon-profil/photos/{uuid}/ — Supprimer une photo
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    @extend_schema(
        tags=['Client - Profil'],
        summary="Ajouter une photo",
        request=UploadPhotoSerializer,
        responses={201: PhotoProfilSerializer},
    )
    def post(self, request):
        try:
            profil = request.user.profil
        except Profil.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UploadPhotoSerializer(data=request.data, context={'profil': profil})
        serializer.is_valid(raise_exception=True)
        photo = serializer.save(profil=profil)
        return Response(PhotoProfilSerializer(photo).data, status=status.HTTP_201_CREATED)


class SupprimerPhotoView(APIView):
    """DELETE /api/client/mon-profil/photos/{uuid}/"""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Profil'],
        summary="Supprimer une photo",
        responses={204: None, 404: None},
    )
    def delete(self, request, uuid):
        try:
            profil = request.user.profil
            photo = profil.photos.get(uuid=uuid)
        except (Profil.DoesNotExist, PhotoProfil.DoesNotExist):
            return Response({'detail': 'Photo introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UploadVideoView(APIView):
    """PUT /api/client/mon-profil/video/ — Uploader ou remplacer la vidéo de présentation."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    @extend_schema(
        tags=['Client - Profil'],
        summary="Uploader la vidéo de présentation",
        responses={200: MonProfilSerializer},
    )
    def put(self, request):
        try:
            profil = request.user.profil
        except Profil.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if 'video_presentation' not in request.FILES:
            return Response({'detail': 'Aucun fichier vidéo fourni.'}, status=status.HTTP_400_BAD_REQUEST)
        profil.video_presentation = request.FILES['video_presentation']
        profil.save(update_fields=['video_presentation', 'updated_at'])
        return Response(MonProfilSerializer(profil).data)
