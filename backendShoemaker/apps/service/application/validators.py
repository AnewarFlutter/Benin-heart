"""
Validators for Service app
"""
from rest_framework import serializers


def validate_delai(delai_min, delai_max):
    """
    Valide que le délai maximum est supérieur au délai minimum.
    """
    if delai_max and delai_max < delai_min:
        raise serializers.ValidationError(
            "Le délai maximum doit être supérieur au délai minimum."
        )
