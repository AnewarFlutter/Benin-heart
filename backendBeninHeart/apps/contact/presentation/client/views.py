"""
DRF ViewSets for Contact Client API.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import ContactInfo
from .serializers import ClientContactSerializer, ClientContactInfoSerializer
from apps.users.decorators.turnstile_required import turnstile_required


@extend_schema_view(
    create=extend_schema(
        tags=['Client - Contact'],
        summary="Envoyer un message de contact",
        description="Permet à un utilisateur d'envoyer un message via le formulaire de contact. "
                    "L'utilisateur reçoit une confirmation par email et les administrateurs configurés sont notifiés."
    ),
)
class ClientContactViewSet(viewsets.GenericViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for Contact model (Client).
    Clients can only create contact messages.
    """
    serializer_class = ClientContactSerializer
    permission_classes = [AllowAny]

    @turnstile_required
    def create(self, request, *args, **kwargs):
        """Create a new contact message using the use case pattern."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from ...application.use_cases import CreateContactUseCase
        from ...infrastructure.repositories import ContactRepository
        from ...application.dtos import CreateContactDTO

        dto = CreateContactDTO(
            name=serializer.validated_data['name'],
            email=serializer.validated_data['email'],
            phone=serializer.validated_data.get('phone'),
            sujet=serializer.validated_data.get('sujet', ''),
            message=serializer.validated_data['message']
        )

        use_case = CreateContactUseCase(ContactRepository())
        contact_dto = use_case.execute(dto)

        # Return simple success response
        return Response(
            {
                'message': 'Votre message a été envoyé avec succès. Vous recevrez une confirmation par email.'
            },
            status=status.HTTP_201_CREATED
        )


@extend_schema_view(
    list=extend_schema(
        tags=['Client - Contact Info'],
        summary="Récupérer les informations de contact de l'entreprise",
        description="Permet aux clients de récupérer les coordonnées de l'entreprise (adresse, téléphones, emails, horaires).",
        responses={
            200: ClientContactInfoSerializer,
            404: {"description": "Informations de contact non configurées"}
        }
    ),
)
class ClientContactInfoViewSet(viewsets.ViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ContactInfo model (Client - read only).
    Clients can only retrieve contact information.
    """
    permission_classes = [AllowAny]
    serializer_class = ClientContactInfoSerializer

    def list(self, request):
        """
        Récupère les informations de contact de l'entreprise.
        GET /api/client/contact-info/
        """
        instance = ContactInfo.get_instance()
        serializer = ClientContactInfoSerializer(instance)
        return Response(serializer.data)
