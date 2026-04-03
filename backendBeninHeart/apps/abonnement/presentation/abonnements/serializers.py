"""
Serializers for client abonnement endpoints.
"""
from rest_framework import serializers
from ...models import PlanAbonnement, Souscription


class PlanAbonnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanAbonnement
        fields = [
            'uuid', 'slug', 'titre', 'description', 'prix', 'prix_affiche',
            'duree', 'fonctionnalites', 'fonctionnalites_exclues',
            'est_populaire', 'icone', 'ordre',
        ]
        read_only_fields = fields


class CreerSouscriptionSerializer(serializers.ModelSerializer):
    plan_slug = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=PlanAbonnement.objects.filter(est_actif=True),
        source='plan',
        write_only=True,
    )

    class Meta:
        model = Souscription
        fields = [
            'plan_slug', 'nombre_mois',
            'prenom', 'nom', 'telephone',
            'adresse', 'ville', 'code_postal', 'code_promo',
        ]

    def validate_nombre_mois(self, value):
        if value < 1:
            raise serializers.ValidationError("Le nombre de mois doit être au moins 1.")
        return value


class SouscriptionSerializer(serializers.ModelSerializer):
    plan = PlanAbonnementSerializer(read_only=True)

    class Meta:
        model = Souscription
        fields = [
            'uuid', 'plan', 'statut', 'date_debut', 'date_fin',
            'nombre_mois', 'prenom', 'nom', 'created_at',
        ]
        read_only_fields = fields
