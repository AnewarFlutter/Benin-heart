"""
Validators for Devis app
"""
from rest_framework import serializers


def validate_example(value):
    """
    Exemple de validateur.
    """
    if not value:
        raise serializers.ValidationError("Ce champ est requis.")
    return value
