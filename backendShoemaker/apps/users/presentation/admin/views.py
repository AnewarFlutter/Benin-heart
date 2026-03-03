"""
Admin ViewSets - Reserved for ADMIN/SUPERADMIN roles only.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from drf_spectacular.utils import extend_schema

from ...models import User, DeliveryPerson
from .permissions import IsAdminOrSuperAdmin, CanManageUsers, IsSuperAdminOnly
from .serializers import (
    UserSerializer, UserListSerializer, DeliveryPersonSerializer,
    ManageRolesSerializer, BlockUnblockUserSerializer, ActivateDeactivateUserSerializer,
    ValidateOTPSerializer, AdminResetPasswordSerializer, AdminChangePasswordSerializer,
    AdminCreateUserSerializer, AdminUpdateUserSerializer,
    AdminProfileSerializer, AdminProfileUpdateSerializer, AdminSelfChangePasswordSerializer
)
from ...tasks import send_password_reset_confirmation_email_task


class AdminUserViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet d'administration pour la gestion complète des utilisateurs.

    Fonctionnalités:
    - Consultation de la liste des utilisateurs (clients, livreurs, admins)
    - Modification des rôles et accès
    - Blocage/déblocage de comptes
    - Activation/désactivation de comptes
    - Validation manuelle d'OTP
    - Modification/réinitialisation de mot de passe
    - Suppression logique (soft delete)
    - Restauration de comptes supprimés
    """
    queryset = User.objects.all()
    permission_classes = [IsAdminOrSuperAdmin, CanManageUsers]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action."""
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'create':
            return AdminCreateUserSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUpdateUserSerializer
        return UserSerializer

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Liste des utilisateurs',
        description='Récupère la liste de tous les utilisateurs (clients, livreurs, admins). Filtrable par rôle, statut, recherche'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Détails d\'un utilisateur',
        description='Récupère les détails complets d\'un utilisateur spécifique'
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Créer un utilisateur',
        description='Créer un nouvel utilisateur (client, livreur ou admin)'
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Modifier un utilisateur',
        description='Modifier complètement un utilisateur existant'
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Supprimer définitivement un utilisateur',
        description='Suppression DÉFINITIVE d\'un utilisateur (utiliser soft_delete à la place pour conserver les données)'
    )
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        email = user.email
        user.delete()
        return Response({
            'message': f'Utilisateur {email} supprimé définitivement avec succès'
        }, status=status.HTTP_200_OK)

    def get_queryset(self):
        """
        Filtre le queryset selon les paramètres de requête.
        Supporte: role, is_active, is_verified, is_blocked, is_deleted
        """
        queryset = User.objects.select_related('delivery_profile').prefetch_related('roles').order_by('-created_at')

        # Pour les actions restore et soft_delete, on doit pouvoir accéder aux utilisateurs supprimés
        if self.action in ['restore', 'soft_delete']:
            # Ne pas filtrer par is_deleted pour ces actions
            pass
        else:
            # Filtres
            role = self.request.query_params.get('role', None)
            is_active = self.request.query_params.get('is_active', None)
            is_verified = self.request.query_params.get('is_verified', None)
            is_blocked = self.request.query_params.get('is_blocked', None)
            is_deleted = self.request.query_params.get('is_deleted', None)
            search = self.request.query_params.get('search', None)

            if role:
                queryset = queryset.filter(roles__name=role.upper())
            if is_active is not None:
                queryset = queryset.filter(is_active=is_active.lower() == 'true')
            if is_verified is not None:
                queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
            if is_blocked is not None:
                queryset = queryset.filter(is_blocked=is_blocked.lower() == 'true')
            if is_deleted is not None:
                queryset = queryset.filter(is_deleted=is_deleted.lower() == 'true')
            else:
                # Par défaut, exclure les utilisateurs supprimés
                queryset = queryset.filter(is_deleted=False)

            # Recherche par email, nom, prénom
            if search:
                queryset = queryset.filter(
                    Q(email__icontains=search) |
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search) |
                    Q(username__icontains=search)
                )

        return queryset


    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Statistiques des utilisateurs',
        description='Récupère les statistiques globales des utilisateurs (total, par rôle, par statut)'
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Récupère les statistiques des utilisateurs.
        GET /api/admin/users/statistics/
        """
        total_users = User.objects.filter(is_deleted=False).count()
        clients = User.objects.filter(roles__name='CLIENT', is_deleted=False).count()
        deliveries = User.objects.filter(roles__name='DELIVERY', is_deleted=False).count()
        admins = User.objects.filter(roles__name='ADMIN', is_deleted=False).count()
        superadmins = User.objects.filter(roles__name='SUPERADMIN', is_deleted=False).count()
        verified = User.objects.filter(is_verified=True, is_deleted=False).count()
        active = User.objects.filter(is_active=True, is_deleted=False).count()
        blocked = User.objects.filter(is_blocked=True, is_deleted=False).count()
        deleted = User.objects.filter(is_deleted=True).count()

        return Response({
            'total_users': total_users,
            'by_role': {
                'clients': clients,
                'deliveries': deliveries,
                'admins': admins,
                'superadmins': superadmins,
            },
            'by_status': {
                'verified': verified,
                'active': active,
                'blocked': blocked,
                'deleted': deleted,
            }
        })

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Gérer les rôles d\'un utilisateur',
        description='Modifier le rôle d\'un utilisateur (CLIENT, DELIVERY, ADMIN, SUPERADMIN)',
        request=ManageRolesSerializer
    )
    @action(detail=True, methods=['post'])
    def manage_roles(self, request, uuid=None):
        """
        Gérer les rôles d'un utilisateur (système multi-rôles).
        POST /api/admin/users/{id}/manage_roles/

        Body: {
            "roles": ["CLIENT", "DELIVERY"],
            "action": "add" | "remove" | "set"
        }

        Actions:
        - "add": Ajoute les rôles spécifiés à l'utilisateur
        - "remove": Retire les rôles spécifiés de l'utilisateur
        - "set": Définit exactement les rôles spécifiés (remplace tous les rôles existants)
        """
        user = self.get_object()
        serializer = ManageRolesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        roles = serializer.validated_data['roles']
        action_type = serializer.validated_data['action']

        # Vérifier les permissions (ADMIN ne peut pas gérer les rôles ADMIN/SUPERADMIN)
        if request.user.has_role('ADMIN') and not request.user.has_role('SUPERADMIN'):
            for role_name in roles:
                if role_name in ['ADMIN', 'SUPERADMIN']:
                    return Response(
                        {'error': 'Seul un SUPERADMIN peut gérer les rôles ADMIN ou SUPERADMIN.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

        old_roles = user.get_roles_list()
        had_delivery_role = 'DELIVERY' in old_roles

        if action_type == 'add':
            # Ajouter les rôles
            for role_name in roles:
                user.add_role(role_name)
            message = f'Rôles ajoutés: {", ".join(roles)}'

        elif action_type == 'remove':
            # Retirer les rôles
            for role_name in roles:
                user.remove_role(role_name)
            message = f'Rôles retirés: {", ".join(roles)}'

        elif action_type == 'set':
            # Définir exactement ces rôles (remplacer tous)
            user.roles.clear()
            for role_name in roles:
                user.add_role(role_name)
            message = f'Rôles définis: {", ".join(roles)}'

        new_roles = user.get_roles_list()
        has_delivery_role = 'DELIVERY' in new_roles

        # Gestion automatique du profil DeliveryPerson
        # Si le rôle DELIVERY est ajouté et qu'il n'y a pas de profil, créer le profil
        if has_delivery_role and not had_delivery_role:
            if not hasattr(user, 'delivery_profile'):
                DeliveryPerson.objects.create(
                    user=user,
                    is_available=True
                )
                message += ' | Profil livreur créé automatiquement'

        # Si le rôle DELIVERY est retiré et qu'il y a un profil, supprimer le profil
        elif not has_delivery_role and had_delivery_role:
            if hasattr(user, 'delivery_profile'):
                user.delivery_profile.delete()
                message += ' | Profil livreur supprimé automatiquement'

        return Response({
            'message': message,
            'old_roles': old_roles,
            'new_roles': new_roles,
            'user': UserSerializer(user).data
        })

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Bloquer/débloquer un compte utilisateur',
        description='Bloquer ou débloquer temporairement un compte utilisateur avec raison optionnelle',
        request=BlockUnblockUserSerializer
    )
    @action(detail=True, methods=['post'])
    def block_unblock(self, request, uuid=None):
        """
        Bloquer ou débloquer un compte utilisateur.
        POST /api/admin/users/{id}/block_unblock/

        Body: {
            "is_blocked": true/false,
            "reason": "Raison du blocage" (optionnel)
        }
        """
        user = self.get_object()
        serializer = BlockUnblockUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_blocked = serializer.validated_data['is_blocked']
        reason = serializer.validated_data.get('reason', '')

        user.is_blocked = is_blocked
        user.save()

        action_msg = 'bloqué' if is_blocked else 'débloqué'
        response_data = {
            'message': f'Compte {action_msg} avec succès',
            'user': UserSerializer(user).data
        }

        if reason and is_blocked:
            response_data['reason'] = reason

        return Response(response_data)

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Activer/désactiver un compte utilisateur',
        description='Activer ou désactiver un compte utilisateur (is_active)',
        request=ActivateDeactivateUserSerializer
    )
    @action(detail=True, methods=['post'])
    def activate_deactivate(self, request, uuid=None):
        """
        Activer ou désactiver un compte utilisateur.
        POST /api/admin/users/{id}/activate_deactivate/

        Body: {
            "is_active": true/false
        }
        """
        user = self.get_object()
        serializer = ActivateDeactivateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_active = serializer.validated_data['is_active']
        user.is_active = is_active
        user.save()

        action_msg = 'activé' if is_active else 'désactivé'
        return Response({
            'message': f'Compte {action_msg} avec succès',
            'user': UserSerializer(user).data
        })

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Valider/invalider l\'OTP manuellement',
        description='Permet à un admin de valider ou invalider manuellement l\'OTP d\'un utilisateur',
        request=ValidateOTPSerializer
    )
    @action(detail=True, methods=['post'])
    def validate_otp(self, request, uuid=None):
        """
        Valider ou invalider manuellement l'OTP d'un utilisateur.
        POST /api/admin/users/{id}/validate_otp/

        Body: {
            "is_verified": true/false,
            "clear_otp": true (optionnel, défaut: true)
        }
        """
        user = self.get_object()
        serializer = ValidateOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_verified = serializer.validated_data['is_verified']
        clear_otp = serializer.validated_data.get('clear_otp', True)

        user.is_verified = is_verified

        if clear_otp:
            user.otp_code = None
            user.otp_created_at = None

        user.save()

        action_msg = 'validé' if is_verified else 'invalidé'
        return Response({
            'message': f'OTP {action_msg} avec succès',
            'otp_cleared': clear_otp,
            'user': UserSerializer(user).data
        })

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Réinitialiser le mot de passe',
        description='Réinitialiser le mot de passe d\'un utilisateur sans vérification de l\'ancien mot de passe',
        request=AdminResetPasswordSerializer
    )
    @action(detail=True, methods=['post'])
    def reset_password(self, request, uuid=None):
        """
        Réinitialiser le mot de passe d'un utilisateur (sans ancien mot de passe).
        POST /api/admin/users/{id}/reset_password/

        Body: {
            "new_password": "nouveau_mdp",
            "new_password_confirm": "nouveau_mdp",
            "send_email": true (optionnel)
        }
        """
        user = self.get_object()
        serializer = AdminResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data['new_password']
        send_email = serializer.validated_data.get('send_email', True)

        # Définir le nouveau mot de passe
        user.set_password(new_password)
        user.save()

        # Envoyer un email de notification si demandé
        if send_email:
            send_password_reset_confirmation_email_task.delay(
                email=user.email,
                user_name=user.first_name or user.username
            )

        return Response({
            'message': 'Mot de passe réinitialisé avec succès',
            'email_sent': send_email
        })

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Modifier le mot de passe',
        description='Modifier le mot de passe d\'un utilisateur avec vérification de l\'ancien mot de passe',
        request=AdminChangePasswordSerializer
    )
    @action(detail=True, methods=['post'])
    def change_password(self, request, uuid=None):
        """
        Modifier le mot de passe d'un utilisateur (avec vérification de l'ancien).
        POST /api/admin/users/{id}/change_password/

        Body: {
            "current_password": "ancien_mdp",
            "new_password": "nouveau_mdp",
            "new_password_confirm": "nouveau_mdp"
        }
        """
        user = self.get_object()
        serializer = AdminChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        current_password = serializer.validated_data['current_password']
        new_password = serializer.validated_data['new_password']

        # Vérifier l'ancien mot de passe
        if not user.check_password(current_password):
            return Response(
                {'error': 'Le mot de passe actuel est incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Définir le nouveau mot de passe
        user.set_password(new_password)
        user.save()

        return Response({
            'message': 'Mot de passe modifié avec succès'
        })

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Supprimer un compte (soft delete)',
        description='Suppression logique d\'un compte utilisateur. Le compte est marqué comme supprimé mais les données sont conservées'
    )
    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, uuid=None):
        """
        Suppression logique d'un utilisateur.
        DELETE /api/admin/users/{id}/soft_delete/

        Le compte n'est pas supprimé définitivement.
        Les données sont conservées avec is_deleted=True.
        """
        user = self.get_object()

        if user.is_deleted:
            return Response(
                {'error': 'Ce compte est déjà supprimé.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_deleted = True
        user.deleted_at = timezone.now()
        user.is_active = False  # Désactiver le compte aussi
        user.save()

        return Response({
            'message': 'Compte supprimé avec succès (suppression logique)',
            'deleted_at': user.deleted_at
        })

    @extend_schema(
        tags=['Admin - Gestion des utilisateurs'],
        summary='Restaurer un compte supprimé',
        description='Restaurer un compte utilisateur précédemment supprimé (soft delete)'
    )
    @action(detail=True, methods=['post'])
    def restore(self, request, uuid=None):
        """
        Restaurer un compte utilisateur supprimé.
        POST /api/admin/users/{id}/restore/
        """
        user = self.get_object()

        if not user.is_deleted:
            return Response(
                {'error': 'Ce compte n\'est pas supprimé.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_deleted = False
        user.deleted_at = None
        user.is_active = True  # Réactiver le compte
        user.save()

        return Response({
            'message': 'Compte restauré avec succès',
            'user': UserSerializer(user).data
        })


class AdminDeliveryPersonViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    Admin-only ViewSet for managing delivery persons.
    """
    queryset = DeliveryPerson.objects.select_related('user').all()
    serializer_class = DeliveryPersonSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']  # Exclure PATCH

    def get_queryset(self):
        """
        Filtre le queryset selon les paramètres de requête.
        Supporte: is_available, search (par nom/email)
        """
        queryset = DeliveryPerson.objects.select_related('user').all().order_by('-created_at')

        # Filtre par disponibilité
        is_available = self.request.query_params.get('is_available', None)
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')

        # Recherche par nom ou email de l'utilisateur
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )

        return queryset

    @extend_schema(
        tags=['Admin - Gestion des livreurs'],
        summary='Liste des livreurs',
        description='Récupère la liste de tous les livreurs avec leurs profils. Filtrable par disponibilité (is_available) et recherche (search)'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Gestion des livreurs'],
        summary='Détails d\'un livreur',
        description='Récupère les détails complets d\'un livreur spécifique'
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Gestion des livreurs'],
        summary='Créer un profil livreur',
        description='Créer un nouveau profil de livreur'
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Gestion des livreurs'],
        summary='Modifier un livreur',
        description='Modifier complètement un profil de livreur'
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Gestion des livreurs'],
        summary='Supprimer un livreur',
        description='Supprimer un profil de livreur'
    )
    def destroy(self, request, *args, **kwargs):
        delivery_person = self.get_object()
        user_name = delivery_person.user.full_name
        delivery_person.delete()
        return Response({
            'message': f'Profil livreur de {user_name} supprimé avec succès'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Admin - Gestion des livreurs'],
        summary='Statistiques des livreurs',
        description='Récupère les statistiques des livreurs (total, disponibles)'
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get delivery person statistics.
        GET /api/admin/delivery-persons/statistics/
        """
        total = DeliveryPerson.objects.count()
        available = DeliveryPerson.objects.filter(is_available=True).count()
        unavailable = DeliveryPerson.objects.filter(is_available=False).count()

        return Response({
            'total_delivery_persons': total,
            'available': available,
            'unavailable': unavailable,
        })


class AdminProfileView(generics.RetrieveUpdateAPIView):
    """
    Vue pour gérer le profil de l'admin connecté.
    GET /api/admin/profile/ - Récupérer le profil
    PUT /api/admin/profile/ - Mettre à jour le profil (complet)
    PATCH /api/admin/profile/ - Mettre à jour le profil (partiel)
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AdminProfileUpdateSerializer
        return AdminProfileSerializer

    @extend_schema(
        tags=['Admin - Profil'],
        summary='Récupérer mon profil',
        description='Récupère le profil de l\'admin connecté'
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Profil'],
        summary='Mettre à jour mon profil',
        description='Met à jour le profil de l\'admin connecté'
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(
        tags=['Admin - Profil'],
        summary='Mettre à jour mon profil (partiel)',
        description='Met à jour partiellement le profil de l\'admin connecté'
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Retourner le profil complet après la mise à jour
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': AdminProfileSerializer(instance).data
        })


class AdminChangePasswordView(APIView):
    """
    Vue pour changer le mot de passe de l'admin connecté.
    POST /api/admin/change-password/
    """
    permission_classes = [IsAdminOrSuperAdmin]

    @extend_schema(
        tags=['Admin - Profil'],
        summary='Changer mon mot de passe',
        description='Permet à l\'admin connecté de changer son mot de passe',
        request=AdminSelfChangePasswordSerializer,
        responses={200: {'description': 'Mot de passe changé avec succès'}}
    )
    def post(self, request):
        serializer = AdminSelfChangePasswordSerializer(
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
        }, status=status.HTTP_200_OK)
