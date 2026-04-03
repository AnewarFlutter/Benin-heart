"""
Views for client like endpoints.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from ...models import Like, Match
from .serializers import ActionLikeSerializer, LikeReçuSerializer, MatchSerializer, StatsLikesSerializer


class ActionLikeView(APIView):
    """
    POST /api/client/likes/ — Liker, superLiker ou disliker un profil.
    Le signal post_save gère la détection de match automatiquement.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Likes'],
        summary="Liker / Superliker / Disliker un profil",
        request=ActionLikeSerializer,
        responses={201: {'description': 'Action enregistrée'}, 400: None},
    )
    def post(self, request):
        serializer = ActionLikeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profil_uuid = serializer.validated_data['profil_uuid']
        type_action = serializer.validated_data['type_action']

        # Retrouver le destinataire via son profil
        from apps.profil.models import Profil
        try:
            profil_dest = Profil.objects.select_related('user').get(uuid=profil_uuid)
        except Profil.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        destinataire = profil_dest.user
        if destinataire == request.user:
            return Response({'detail': 'Vous ne pouvez pas vous liker vous-même.'}, status=status.HTTP_400_BAD_REQUEST)

        # Créer ou mettre à jour l'action
        like, created = Like.objects.update_or_create(
            expediteur=request.user,
            destinataire=destinataire,
            defaults={'type_action': type_action}
        )

        # Vérifie s'il y a maintenant un match
        est_match = Match.objects.filter(
            est_actif=True
        ).filter(
            user1=min(request.user, destinataire, key=lambda u: u.pk),
            user2=max(request.user, destinataire, key=lambda u: u.pk),
        ).exists()

        return Response({
            'action': type_action,
            'est_match': est_match,
            'created': created,
        }, status=status.HTTP_201_CREATED)


class MesLikesReçusView(APIView):
    """GET /api/client/mes-likes/ — Likes et superlikes reçus."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Likes'],
        summary="Likes et superlikes reçus",
        responses={200: LikeReçuSerializer(many=True)},
    )
    def get(self, request):
        likes = Like.objects.filter(
            destinataire=request.user,
            type_action__in=['LIKE', 'SUPERLIKE']
        ).select_related('expediteur__profil').order_by('-created_at')
        serializer = LikeReçuSerializer(likes, many=True)
        return Response(serializer.data)


class MesMatchsView(APIView):
    """GET /api/client/mes-matchs/ — Tous mes matchs actifs."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Likes'],
        summary="Mes matchs",
        responses={200: MatchSerializer(many=True)},
    )
    def get(self, request):
        from django.db.models import Q
        matchs = Match.objects.filter(
            est_actif=True
        ).filter(
            Q(user1=request.user) | Q(user2=request.user)
        ).select_related('user1__profil', 'user2__profil').order_by('-created_at')
        serializer = MatchSerializer(matchs, many=True, context={'request': request})
        return Response(serializer.data)


class MesStatsView(APIView):
    """GET /api/client/mes-stats/ — Statistiques de likes."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Likes'],
        summary="Mes statistiques de likes",
        responses={200: StatsLikesSerializer},
    )
    def get(self, request):
        from django.db.models import Q
        stats = {
            'total_likes_reçus': Like.objects.filter(destinataire=request.user, type_action='LIKE').count(),
            'total_superlikes_reçus': Like.objects.filter(destinataire=request.user, type_action='SUPERLIKE').count(),
            'total_matchs': Match.objects.filter(
                est_actif=True
            ).filter(Q(user1=request.user) | Q(user2=request.user)).count(),
            'total_likes_envoyés': Like.objects.filter(expediteur=request.user).exclude(type_action='DISLIKE').count(),
        }
        return Response(StatsLikesSerializer(stats).data)
