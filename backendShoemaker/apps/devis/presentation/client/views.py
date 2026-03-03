"""
DRF ViewSets for Devis Client API.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import transaction
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import Devis, DevisProduit
from .serializers import ClientDevisCreateSerializer


@extend_schema_view(
    create=extend_schema(
        tags=['Client - Devis'],
        summary="Soumettre une demande de devis",
        description="Permet à un utilisateur de soumettre une demande de devis pour des chaussures. "
                    "Le client recevra un email de confirmation et les administrateurs seront notifiés.",
        responses={
            201: {
                "description": "Devis créé avec succès",
                "example": {
                    "message": "Votre demande de devis a été envoyée avec succès. Vous recevrez une réponse par email.",
                    "code_devis": "DEV-2025-123456"
                }
            },
            400: {"description": "Données invalides - Vérifiez les champs requis et ajoutez au moins une paire de chaussures"}
        }
    ),
)
class ClientDevisViewSet(viewsets.GenericViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for Devis model (Client).
    Clients can only create devis requests.
    """
    serializer_class = ClientDevisCreateSerializer
    permission_classes = [AllowAny]

    def _parse_formdata_to_nested(self, data, files):
        """
        Parse FormData format produits[0][field] to nested dict format.
        """
        parsed_data = {}
        produits = {}

        # Parser les champs simples et identifier les produits
        for key, value in data.items():
            if key.startswith('produits['):
                # Extraire index et field name: produits[0][marque] -> 0, marque
                import re
                match = re.match(r'produits\[(\d+)\]\[([^\]]+)\](?:\[(\d+)\])?', key)
                if match:
                    index = int(match.group(1))
                    field = match.group(2)
                    sub_index = match.group(3)

                    if index not in produits:
                        produits[index] = {}

                    if sub_index is not None:
                        # C'est un tableau (ex: services_souhaites[0])
                        if field not in produits[index]:
                            produits[index][field] = []
                        produits[index][field].append(value)
                    else:
                        # C'est un champ simple
                        produits[index][field] = value
            else:
                # Champ simple
                parsed_data[key] = value

        # Ajouter les fichiers (photos)
        for key, file in files.items():
            if key.startswith('produits['):
                import re
                match = re.match(r'produits\[(\d+)\]\[([^\]]+)\]', key)
                if match:
                    index = int(match.group(1))
                    field = match.group(2)
                    if index in produits:
                        produits[index][field] = file

        # Convertir produits dict en liste ordonnée
        if produits:
            parsed_data['produits'] = [produits[i] for i in sorted(produits.keys())]

        return parsed_data

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Create a new devis request.
        POST /api/client/devis/
        """
        # Parser FormData si multipart/form-data
        if 'multipart/form-data' in request.content_type:
            data = self._parse_formdata_to_nested(request.data, request.FILES)
        else:
            data = request.data

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Créer le devis
        devis = Devis.objects.create(
            nom_complet=serializer.validated_data['nom_complet'],
            email=serializer.validated_data['email'],
            telephone=serializer.validated_data['telephone'],
            informations_supplementaires=serializer.validated_data.get('informations_supplementaires', '')
        )

        # Créer les produits
        for produit_data in serializer.validated_data['produits']:
            # Convertir les UUIDs en strings pour le stockage JSON
            services_uuids = [str(uuid) for uuid in produit_data['services_souhaites']]

            DevisProduit.objects.create(
                devis=devis,
                marque=produit_data['marque'],
                type_chaussure=produit_data['type_chaussure'],
                photo=produit_data.get('photo'),
                services_souhaites=services_uuids,
                description=produit_data.get('description', '')
            )

        # Envoyer les emails de manière asynchrone
        from ...tasks import send_devis_confirmation_client, send_nouvelle_demande_devis_admin
        transaction.on_commit(lambda: send_devis_confirmation_client.delay(devis.id))
        transaction.on_commit(lambda: send_nouvelle_demande_devis_admin.delay(devis.id))

        return Response(
            {
                'message': 'Votre demande de devis a été envoyée avec succès. Vous recevrez une réponse par email.',
                'code_devis': devis.code_devis
            },
            status=status.HTTP_201_CREATED
        )
