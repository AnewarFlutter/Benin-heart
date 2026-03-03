"""
Celery tasks for devis app - Email notifications
"""
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .models import Devis
from apps.service.models import Service
import logging

logger = logging.getLogger(__name__)


def get_services_names_for_produit(produit):
    """
    Récupère les noms des services à partir des UUIDs stockés dans produit.services_souhaites.
    Retourne une liste de noms de services.
    """
    if not produit.services_souhaites:
        return []

    services = Service.objects.filter(uuid__in=produit.services_souhaites)
    return [service.nom for service in services]


@shared_task(bind=True, max_retries=3)
def send_devis_confirmation_client(self, devis_id):
    """
    Envoie un email de confirmation au client après soumission du devis.
    """
    try:
        devis = Devis.objects.get(id=devis_id)

        # Contexte pour le template
        context = {
            'devis': devis,
            'nom_complet': devis.nom_complet,
            'code_devis': devis.code_devis,
            'nombre_produits': devis.produits.count(),
        }

        # Générer le contenu HTML et texte
        html_content = render_to_string('devis/emails/confirmation_devis_client.html', context)
        text_content = f"""
Bonjour {devis.nom_complet},

Nous avons bien reçu votre demande de devis.

Numéro de devis : {devis.code_devis}
Nombre de paires : {devis.produits.count()}

Nous étudions votre demande et vous enverrons une réponse dans les plus brefs délais.

Cordialement,
L'équipe My Shoemaker
        """.strip()

        # Créer et envoyer l'email
        subject = f'Confirmation de votre demande de devis - {devis.code_devis}'
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = devis.email

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[to_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        logger.info(f"Email de confirmation devis envoyé au client {to_email} pour le devis {devis.code_devis}")

    except Devis.DoesNotExist:
        logger.error(f"Devis {devis_id} non trouvé")
        raise
    except Exception as exc:
        logger.error(f"Erreur lors de l'envoi de l'email de confirmation devis: {exc}")
        raise self.retry(exc=exc, countdown=60 * 5)  # Retry après 5 minutes


@shared_task(bind=True, max_retries=3)
def send_nouvelle_demande_devis_admin(self, devis_id):
    """
    Envoie un email aux admins pour notifier une nouvelle demande de devis.
    """
    try:
        devis = Devis.objects.prefetch_related('produits').get(id=devis_id)

        # Enrichir les produits avec les noms de services
        produits = []
        for produit in devis.produits.all():
            produit.services_names = get_services_names_for_produit(produit)
            produits.append(produit)

        # Contexte pour le template
        context = {
            'devis': devis,
            'produits': produits,
        }

        # Générer le contenu HTML et texte
        html_content = render_to_string('devis/emails/nouvelle_demande_devis_admin.html', context)
        text_content = f"""
Nouvelle demande de devis reçue!

Code devis : {devis.code_devis}
Client : {devis.nom_complet}
Email : {devis.email}
Téléphone : {devis.telephone}
Nombre de paires : {devis.produits.count()}

Connectez-vous à l'admin pour traiter cette demande.
        """.strip()

        # Créer et envoyer l'email
        subject = f'Nouvelle demande de devis - {devis.code_devis}'
        from_email = settings.DEFAULT_FROM_EMAIL

        # Récupérer les emails des administrateurs
        admin_emails = settings.ADMIN_NOTIFICATION_EMAILS

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=admin_emails
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        logger.info(f"Email nouvelle demande devis envoyé aux admins pour le devis {devis.code_devis}")

    except Devis.DoesNotExist:
        logger.error(f"Devis {devis_id} non trouvé")
        raise
    except Exception as exc:
        logger.error(f"Erreur lors de l'envoi de l'email nouvelle demande devis aux admins: {exc}")
        raise self.retry(exc=exc, countdown=60 * 5)


@shared_task(bind=True, max_retries=3)
def send_devis_response_client(self, devis_id):
    """
    Envoie le devis/facture au client après réponse de l'admin.
    """
    try:
        devis = Devis.objects.prefetch_related('produits').get(id=devis_id)

        # Enrichir les produits avec les noms de services
        produits = []
        for produit in devis.produits.all():
            produit.services_names = get_services_names_for_produit(produit)
            produits.append(produit)

        # Contexte pour le template
        context = {
            'devis': devis,
            'produits': produits,
        }

        # Générer le contenu HTML et texte
        html_content = render_to_string('devis/emails/devis_response_client.html', context)
        text_content = f"""
Bonjour {devis.nom_complet},

Votre devis est prêt!

Numéro de devis : {devis.code_devis}
Montant total TTC : {devis.montant_total_ttc} FCFA
Date d'expiration : {devis.date_expiration.strftime('%d/%m/%Y')}

{devis.message_admin if devis.message_admin else ''}

Consultez le détail complet dans l'email.

Cordialement,
L'équipe My Shoemaker
        """.strip()

        # Créer et envoyer l'email
        subject = f'Votre devis est prêt - {devis.code_devis}'
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = devis.email

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[to_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        logger.info(f"Email devis/facture envoyé au client {to_email} pour le devis {devis.code_devis}")

    except Devis.DoesNotExist:
        logger.error(f"Devis {devis_id} non trouvé")
        raise
    except Exception as exc:
        logger.error(f"Erreur lors de l'envoi du devis au client: {exc}")
        raise self.retry(exc=exc, countdown=60 * 5)
