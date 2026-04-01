"""
Validators for the Contact application.
"""
from core.exceptions import ValidationException


class ContactValidator:
    """Validator for contact payloads."""

    @staticmethod
    def validate_name(name: str) -> None:
        if not name or not name.strip():
            raise ValidationException("Le nom est requis")
        if len(name) > 255:
            raise ValidationException("Le nom ne doit pas dépasser 255 caractères")

    @staticmethod
    def validate_email(email: str) -> None:
        if not email:
            raise ValidationException("L'email est requis")
        if "@" not in email:
            raise ValidationException("L'email doit être valide")

    @staticmethod
    def validate_subject(subject: str) -> None:
        if not subject or not subject.strip():
            raise ValidationException("Le sujet est requis")
        if len(subject) > 255:
            raise ValidationException("Le sujet ne doit pas dépasser 255 caractères")

    @staticmethod
    def validate_message(message: str) -> None:
        if not message or not message.strip():
            raise ValidationException("Le message est requis")
        if len(message) < 10:
            raise ValidationException("Le message doit contenir au moins 10 caractères")
