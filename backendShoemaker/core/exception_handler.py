"""
Exception handler personnalisé pour retourner des réponses standardisées.
"""
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied, AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from .exceptions import DomainException, ValidationException, NotFoundException, UnauthorizedException


def custom_exception_handler(exc, context):
    """
    Exception handler personnalisé qui retourne toujours le format :
    {
        "success": False,
        "message": "...",
        "errors": {...}
    }
    """
    # Gérer les exceptions Domain personnalisées
    if isinstance(exc, DomainException):
        status_code = status.HTTP_400_BAD_REQUEST
        if isinstance(exc, NotFoundException):
            status_code = status.HTTP_404_NOT_FOUND
        elif isinstance(exc, UnauthorizedException):
            status_code = status.HTTP_403_FORBIDDEN
        elif isinstance(exc, ValidationException):
            status_code = status.HTTP_400_BAD_REQUEST

        return Response(
            {
                "success": False,
                "message": exc.message,
                "errors": {"detail": exc.message}
            },
            status=status_code
        )

    # Appeler le handler par défaut de DRF d'abord
    response = exception_handler(exc, context)

    if response is not None:
        # Personnaliser le format de la réponse
        custom_response_data = {
            "success": False,
            "message": get_error_message(exc),
            "errors": get_error_details(response.data)
        }
        response.data = custom_response_data

    return response


def get_error_message(exc):
    """
    Extrait un message d'erreur lisible de l'exception.
    """
    if isinstance(exc, ValidationError):
        return "Validation failed"
    elif isinstance(exc, NotFound) or isinstance(exc, Http404):
        return "Resource not found"
    elif isinstance(exc, PermissionDenied) or isinstance(exc, DjangoPermissionDenied):
        return "You don't have permission to perform this action"
    elif isinstance(exc, AuthenticationFailed):
        return "Authentication failed"
    elif hasattr(exc, 'detail'):
        # Essayer d'extraire le message de l'exception
        if isinstance(exc.detail, dict):
            # Si c'est un dictionnaire, prendre le premier message
            return str(list(exc.detail.values())[0]) if exc.detail else "An error occurred"
        elif isinstance(exc.detail, list):
            # Si c'est une liste, prendre le premier élément
            return str(exc.detail[0]) if exc.detail else "An error occurred"
        else:
            # Sinon, convertir en string
            return str(exc.detail)
    else:
        return "An error occurred"


def get_error_details(data):
    """
    Formate les détails d'erreur de manière cohérente.
    """
    if isinstance(data, dict):
        # Si c'est déjà un dictionnaire, le retourner tel quel
        return data
    elif isinstance(data, list):
        # Si c'est une liste, la convertir en dictionnaire
        return {"detail": data}
    elif isinstance(data, str):
        # Si c'est une string, la mettre dans un dictionnaire
        return {"detail": data}
    else:
        # Sinon, retourner None
        return None
