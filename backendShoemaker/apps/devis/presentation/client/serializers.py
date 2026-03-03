"""
DRF Serializers for Devis Client API.
"""
from rest_framework import serializers
from ...models import Devis, DevisProduit
from apps.service.models import Service


class DevisProduitCreateSerializer(serializers.Serializer):
    """
    Serializer pour créer un produit dans un devis.
    """
    marque = serializers.CharField(
        max_length=100,
        help_text="Marque de la chaussure (ex: Nike, Adidas, etc.)"
    )
    type_chaussure = serializers.CharField(
        max_length=100,
        help_text="Type de chaussure (ex: Basket, Escarp, etc.)"
    )
    photo = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo de la paire de chaussures (optionnel)"
    )
    services_souhaites = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        help_text="Liste des UUIDs des services souhaités (au moins 1)"
    )

    def validate_services_souhaites(self, value):
        """Valide que tous les UUIDs correspondent à des services actifs."""
        if not value:
            raise serializers.ValidationError("Vous devez sélectionner au moins un service.")

        # Vérifier que tous les UUIDs existent et correspondent à des services actifs
        services_ids = [str(uuid) for uuid in value]
        services = Service.objects.filter(uuid__in=services_ids, statut='actif')

        if services.count() != len(services_ids):
            found_ids = set(str(s.uuid) for s in services)
            missing_ids = set(services_ids) - found_ids
            raise serializers.ValidationError(
                f"Services invalides ou inactifs: {', '.join(missing_ids)}"
            )

        return value
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Description de l'état ou problèmes spécifiques (optionnel)"
    )


class ClientDevisCreateSerializer(serializers.Serializer):
    """
    Serializer pour créer une demande de devis (Client).
    """
    nom_complet = serializers.CharField(
        max_length=255,
        help_text="Nom complet du client"
    )
    email = serializers.EmailField(
        help_text="Adresse email du client"
    )
    telephone = serializers.CharField(
        max_length=20,
        help_text="Numéro de téléphone du client"
    )
    informations_supplementaires = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Informations supplémentaires (optionnel)"
    )
    produits = DevisProduitCreateSerializer(
        many=True,
        min_length=1,
        help_text="Liste des paires de chaussures (minimum 1)"
    )

    def validate_produits(self, value):
        """Valide qu'il y a au moins un produit."""
        if not value or len(value) == 0:
            raise serializers.ValidationError("Vous devez ajouter au moins une paire de chaussures.")
        return value
