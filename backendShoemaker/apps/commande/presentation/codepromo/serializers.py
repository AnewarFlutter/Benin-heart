"""
DRF Serializers for Code Promo Client API.
"""
from rest_framework import serializers
from ...models import CodePromo


class ClientCodePromoSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer for CodePromo model (Client - Read Only).
    Permet aux clients de consulter les codes promo valides.
    """
    valeur = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    est_valide = serializers.SerializerMethodField(
        help_text="Indique si le code promo est valide (actif et dans les dates)"
    )
    type_reduction_display = serializers.CharField(
        source='get_type_reduction_display',
        read_only=True,
        help_text="Libellé du type de réduction"
    )
    utilisations_actuelles = serializers.SerializerMethodField(
        help_text="Nombre d'utilisations actuelles du code promo"
    )

    class Meta:
        model = CodePromo
        fields = [
            'id', 'code', 'type_reduction', 'type_reduction_display',
            'valeur', 'description', 'est_valide', 'utilisations_actuelles'
        ]
        read_only_fields = fields

    def get_est_valide(self, obj):
        """Retourne True si le code promo est valide."""
        return obj.est_valide()

    def get_utilisations_actuelles(self, obj):
        """Retourne le nombre d'utilisations actuelles."""
        return obj.utilisations_actuelles()
