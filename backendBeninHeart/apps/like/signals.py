"""
Signals — Détection automatique des matchs après un Like.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@receiver(post_save, sender='like.Like')
def detecter_match(sender, instance, created, **kwargs):
    """
    Après un Like, vérifie si l'autre personne a aussi liké.
    Si oui → crée un Match et envoie une notification WebSocket aux deux.
    """
    if not created or instance.type_action == 'DISLIKE':
        return

    from .models import Like, Match

    # Vérifie si le destinataire a aussi liké l'expéditeur
    match_retour = Like.objects.filter(
        expediteur=instance.destinataire,
        destinataire=instance.expediteur,
        type_action__in=['LIKE', 'SUPERLIKE']
    ).exists()

    if not match_retour:
        # Pas encore de match — notifier quand même le destinataire du like
        _notifier_like(instance)
        return

    # Match ! Créer la relation
    match, created_match = Match.get_or_create_ordered(instance.expediteur, instance.destinataire)

    if created_match:
        _notifier_match(match, instance.expediteur, instance.destinataire)


def _notifier_like(like_instance):
    """Envoie une notification 'nouveau_like' au destinataire."""
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    destinataire_id = like_instance.destinataire_id
    async_to_sync(channel_layer.group_send)(
        f'notifications_{destinataire_id}',
        {
            'type': 'nouveau_like',
            'data': {
                'expediteur_uuid': str(like_instance.expediteur.profil.uuid)
                if hasattr(like_instance.expediteur, 'profil') else None,
                'type_action': like_instance.type_action,
            }
        }
    )


def _notifier_match(match, user_a, user_b):
    """Envoie une notification 'nouveau_match' aux deux utilisateurs."""
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    payload_a = {
        'type': 'nouveau_match',
        'data': {
            'match_uuid': str(match.uuid),
            'avec': {
                'uuid': str(user_b.profil.uuid) if hasattr(user_b, 'profil') else None,
                'prenom': user_b.profil.prenom if hasattr(user_b, 'profil') else user_b.first_name,
            }
        }
    }
    payload_b = {
        'type': 'nouveau_match',
        'data': {
            'match_uuid': str(match.uuid),
            'avec': {
                'uuid': str(user_a.profil.uuid) if hasattr(user_a, 'profil') else None,
                'prenom': user_a.profil.prenom if hasattr(user_a, 'profil') else user_a.first_name,
            }
        }
    }

    async_to_sync(channel_layer.group_send)(f'notifications_{user_a.pk}', payload_a)
    async_to_sync(channel_layer.group_send)(f'notifications_{user_b.pk}', payload_b)
