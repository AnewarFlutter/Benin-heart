#!/usr/bin/env python
"""
Script générique pour créer une nouvelle app Django avec architecture Clean.
Usage: python create_django_app.py <nom_app>

Exemple: python create_django_app.py commande
"""
import os
import sys


def create_app_structure(app_name):
    """
    Crée la structure complète d'une app Django avec architecture Clean.

    Args:
        app_name: Nom de l'app à créer (ex: 'service', 'commande', 'produit')
    """
    BASE_DIR = os.path.join(os.getcwd(), "apps", app_name)

    # Nom de l'app en majuscules pour les classes
    APP_NAME_TITLE = app_name.capitalize()
    APP_NAME_UPPER = app_name.upper()

    print(f"Creating '{app_name}' app structure at: {BASE_DIR}")

    # Structure des dossiers
    DIRECTORIES = [
        "application",
        "domain",
        "infrastructure",
        "migrations",
        "presentation",
        "presentation/admin",
        f"presentation/{app_name}s",  # Ex: presentation/services, presentation/commandes
    ]

    # Fichiers de base avec contenu minimal
    FILES = {
        "__init__.py": "",

        "apps.py": f'''from django.apps import AppConfig


class {APP_NAME_TITLE}Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.{app_name}'
    verbose_name = '{APP_NAME_TITLE}'
''',

        "models.py": f'''"""
{APP_NAME_TITLE} models
"""
from django.db import models
from core.base_models import TimeStampedModel


class {APP_NAME_TITLE}(TimeStampedModel):
    """
    Modèle pour {app_name}.
    """
    # TODO: Ajouter les champs du modèle ici
    nom = models.CharField(max_length=255, verbose_name="Nom")

    class Meta:
        db_table = '{app_name}s'
        verbose_name = '{APP_NAME_TITLE}'
        verbose_name_plural = '{APP_NAME_TITLE}s'
        ordering = ['-created_at']

    def __str__(self):
        return self.nom
''',

        "admin.py": f'''from django.contrib import admin
from .models import {APP_NAME_TITLE}


@admin.register({APP_NAME_TITLE})
class {APP_NAME_TITLE}Admin(admin.ModelAdmin):
    list_display = ['nom', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['nom']
    ordering = ['-created_at']
''',

        "tasks.py": f'''"""
Celery tasks for {app_name} app
"""
from celery import shared_task


@shared_task
def example_task():
    """
    Tâche d'exemple.
    """
    pass
''',

        # Application layer
        "application/__init__.py": "",
        "application/dtos.py": f'''"""
Data Transfer Objects for {APP_NAME_TITLE} app
"""


class {APP_NAME_TITLE}DTO:
    """DTO for {APP_NAME_TITLE} data transfer."""
    pass
''',
        "application/use_cases.py": f'''"""
Use cases for {APP_NAME_TITLE} app
"""


class Create{APP_NAME_TITLE}UseCase:
    """Use case for creating a {app_name}."""
    pass


class Update{APP_NAME_TITLE}UseCase:
    """Use case for updating a {app_name}."""
    pass


class Delete{APP_NAME_TITLE}UseCase:
    """Use case for deleting a {app_name}."""
    pass
''',
        "application/validators.py": f'''"""
Validators for {APP_NAME_TITLE} app
"""
from rest_framework import serializers


def validate_example(value):
    """
    Exemple de validateur.
    """
    if not value:
        raise serializers.ValidationError("Ce champ est requis.")
    return value
''',

        # Domain layer
        "domain/__init__.py": "",
        "domain/entities.py": f'''"""
Domain entities for {APP_NAME_TITLE} app
"""


class {APP_NAME_TITLE}Entity:
    """{APP_NAME_TITLE} domain entity."""
    pass
''',
        "domain/repositories.py": f'''"""
Repository interfaces for {APP_NAME_TITLE} app
"""
from abc import ABC, abstractmethod


class {APP_NAME_TITLE}Repository(ABC):
    """{APP_NAME_TITLE} repository interface."""

    @abstractmethod
    def get_by_id(self, id):
        pass

    @abstractmethod
    def get_all(self):
        pass

    @abstractmethod
    def create(self, data):
        pass

    @abstractmethod
    def update(self, id, data):
        pass

    @abstractmethod
    def delete(self, id):
        pass
''',
        "domain/services.py": f'''"""
Domain services for {APP_NAME_TITLE} app
"""


class {APP_NAME_TITLE}DomainService:
    """{APP_NAME_TITLE} domain service."""
    pass
''',

        # Infrastructure layer
        "infrastructure/__init__.py": "",
        "infrastructure/repositories.py": f'''"""
Repository implementations for {APP_NAME_TITLE} app
"""
from ..models import {APP_NAME_TITLE}
from ..domain.repositories import {APP_NAME_TITLE}Repository


class Django{APP_NAME_TITLE}Repository({APP_NAME_TITLE}Repository):
    """Django ORM implementation of {APP_NAME_TITLE}Repository."""

    def get_by_id(self, id):
        return {APP_NAME_TITLE}.objects.get(id=id)

    def get_all(self):
        return {APP_NAME_TITLE}.objects.all()

    def create(self, data):
        return {APP_NAME_TITLE}.objects.create(**data)

    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, id):
        instance = self.get_by_id(id)
        instance.delete()
''',

        # Migrations
        "migrations/__init__.py": "",

        # Presentation layer - Admin
        "presentation/__init__.py": "",
        "presentation/admin/__init__.py": "",
        "presentation/admin/permissions.py": '''"""
Permissions for admin endpoints
"""
from rest_framework import permissions


class IsAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est ADMIN ou SUPERADMIN.
    """
    message = "Accès réservé aux administrateurs."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (
                request.user.is_staff or
                request.user.is_superuser or
                request.user.has_any_role(['ADMIN', 'SUPERADMIN'])
            )
        )
''',

        "presentation/admin/serializers.py": f'''"""
Serializers for admin endpoints
"""
from rest_framework import serializers
from ...models import {APP_NAME_TITLE}


class Admin{APP_NAME_TITLE}Serializer(serializers.ModelSerializer):
    """Serializer for admin {app_name} management."""

    class Meta:
        model = {APP_NAME_TITLE}
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class Admin{APP_NAME_TITLE}ListSerializer(serializers.ModelSerializer):
    """Serializer for listing {app_name}s (admin)."""

    class Meta:
        model = {APP_NAME_TITLE}
        fields = ['id', 'nom', 'created_at']
''',

        "presentation/admin/views.py": f'''"""
Views for admin endpoints
"""
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
from ...models import {APP_NAME_TITLE}
from .serializers import Admin{APP_NAME_TITLE}Serializer, Admin{APP_NAME_TITLE}ListSerializer
from .permissions import IsAdminOrSuperAdmin


class Admin{APP_NAME_TITLE}ViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ADMIN {app_name} management.
    """
    queryset = {APP_NAME_TITLE}.objects.all()
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'list':
            return Admin{APP_NAME_TITLE}ListSerializer
        return Admin{APP_NAME_TITLE}Serializer

    @extend_schema(
        tags=['ADMIN - {APP_NAME_TITLE}'],
        summary="Liste des {app_name}s",
        description="Récupère la liste de tous les {app_name}s"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - {APP_NAME_TITLE}'],
        summary="Détails d'un {app_name}",
        description="Récupère les détails d'un {app_name} spécifique"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - {APP_NAME_TITLE}'],
        summary="Créer un {app_name}",
        description="Créer un nouveau {app_name}",
        request=Admin{APP_NAME_TITLE}Serializer
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - {APP_NAME_TITLE}'],
        summary="Modifier un {app_name}",
        description="Modifier un {app_name} existant",
        request=Admin{APP_NAME_TITLE}Serializer
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - {APP_NAME_TITLE}'],
        summary="Supprimer un {app_name}",
        description="Supprimer un {app_name}"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
''',

        "presentation/admin/urls.py": f'''"""
URL configuration for admin endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Admin{APP_NAME_TITLE}ViewSet

router = DefaultRouter()
router.register(r'{app_name}s', Admin{APP_NAME_TITLE}ViewSet, basename='admin-{app_name}')

urlpatterns = [
    path('admin/', include(router.urls)),
]
''',

        # Presentation layer - Client (Public)
        f"presentation/{app_name}s/__init__.py": "",
        f"presentation/{app_name}s/serializers.py": f'''"""
Serializers for client endpoints (public)
"""
from rest_framework import serializers
from ...models import {APP_NAME_TITLE}


class Client{APP_NAME_TITLE}Serializer(serializers.ModelSerializer):
    """Serializer for client {app_name} viewing (public)."""

    class Meta:
        model = {APP_NAME_TITLE}
        fields = ['id', 'nom']
        read_only_fields = fields
''',

        f"presentation/{app_name}s/views.py": f'''"""
Views for client endpoints (public)
"""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from ...models import {APP_NAME_TITLE}
from .serializers import Client{APP_NAME_TITLE}Serializer


class Client{APP_NAME_TITLE}ViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for CLIENT {app_name} viewing (public, read-only).
    """
    queryset = {APP_NAME_TITLE}.objects.all()
    serializer_class = Client{APP_NAME_TITLE}Serializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Client - {APP_NAME_TITLE}'],
        summary="Liste des {app_name}s",
        description="Récupère la liste des {app_name}s (accès public)"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Client - {APP_NAME_TITLE}'],
        summary="Détails d'un {app_name}",
        description="Récupère les détails d'un {app_name} (accès public)"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
''',

        f"presentation/{app_name}s/urls.py": f'''"""
URL configuration for client endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Client{APP_NAME_TITLE}ViewSet

router = DefaultRouter()
router.register(r'{app_name}s', Client{APP_NAME_TITLE}ViewSet, basename='client-{app_name}')

urlpatterns = [
    path('client/', include(router.urls)),
]
''',
    }

    # Créer le dossier de base
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
        print(f"[OK] Created base directory: {BASE_DIR}")
    else:
        print(f"[WARNING] Directory already exists: {BASE_DIR}")

    # Créer tous les sous-dossiers
    for directory in DIRECTORIES:
        dir_path = os.path.join(BASE_DIR, directory)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            print(f"[OK] Created directory: {directory}")

    # Créer tous les fichiers
    for file_path, content in FILES.items():
        full_path = os.path.join(BASE_DIR, file_path)

        # S'assurer que le dossier parent existe
        parent_dir = os.path.dirname(full_path)
        if parent_dir and not os.path.exists(parent_dir):
            os.makedirs(parent_dir)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Created file: {file_path}")

    print(f"\n[SUCCESS] App '{app_name}' created successfully!")
    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print(f"1. Add 'apps.{app_name}' to INSTALLED_APPS in settings/base.py")
    print("2. Add URLs to config/urls.py:")
    print(f"   path('api/', include('apps.{app_name}.presentation.admin.urls')),")
    print(f"   path('api/', include('apps.{app_name}.presentation.{app_name}s.urls')),")
    print(f"3. Customize the model in apps/{app_name}/models.py")
    print(f"4. Run: python manage.py makemigrations {app_name}")
    print(f"5. Run: python manage.py migrate {app_name}")
    print("="*60)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python create_django_app.py <app_name>")
        print("Example: python create_django_app.py commande")
        sys.exit(1)

    app_name = sys.argv[1].lower()

    # Validation du nom d'app
    if not app_name.isidentifier():
        print(f"Error: '{app_name}' is not a valid Python identifier")
        sys.exit(1)

    create_app_structure(app_name)
