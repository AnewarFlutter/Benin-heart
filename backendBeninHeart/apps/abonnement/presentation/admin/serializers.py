"""
Serializers for admin abonnement endpoints.
"""
from rest_framework import serializers
from ...models import PlanAbonnement, Souscription


class AdminPlanAbonnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanAbonnement
        fields = [
            'id', 'uuid', 'slug', 'titre', 'description', 'prix', 'prix_affiche',
            'duree', 'fonctionnalites', 'fonctionnalites_exclues',
            'est_populaire', 'icone', 'ordre', 'est_actif',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'uuid', 'created_at', 'updated_at']


class AdminPlanAbonnementListSerializer(serializers.ModelSerializer):
    souscriptions_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = PlanAbonnement
        fields = [
            'id', 'uuid', 'slug', 'titre', 'prix_affiche',
            'est_populaire', 'est_actif', 'ordre', 'souscriptions_count',
        ]
        read_only_fields = fields


class AdminSouscriptionUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class AdminSouscriptionSerializer(serializers.ModelSerializer):
    user = AdminSouscriptionUserSerializer(read_only=True)
    plan_titre = serializers.CharField(source='plan.titre', read_only=True)

    class Meta:
        model = Souscription
        fields = [
            'id', 'uuid', 'user', 'plan', 'plan_titre', 'statut',
            'date_debut', 'date_fin', 'nombre_mois',
            'prenom', 'nom', 'telephone', 'adresse', 'ville', 'code_postal',
            'code_promo', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'uuid', 'user', 'created_at', 'updated_at']


class AdminSouscriptionUpdateSerializer(serializers.ModelSerializer):
    """Permet de modifier statut + dates + notes uniquement."""
    class Meta:
        model = Souscription
        fields = ['statut', 'date_debut', 'date_fin', 'notes']
