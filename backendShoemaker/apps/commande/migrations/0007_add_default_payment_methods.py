# Generated migration for adding default payment methods
from django.db import migrations


def add_default_payment_methods(apps, schema_editor):
    """
    Ajoute les moyens de paiement par défaut avec les codes exacts.
    Ces codes sont utilisés pour le mapping côté frontend.
    """
    MoyenPaiement = apps.get_model('commande', 'MoyenPaiement')

    # Définir les moyens de paiement par défaut avec les codes EXACTS
    # IMPORTANT: Ces codes doivent correspondre exactement aux codes dans la base de données
    # et sont mappés côté frontend (payment-method-selector.tsx)
    default_payment_methods = [
        {
            'nom': 'Carte Bancaire',
            'code': 'CARTEBACAIRECODE',
            'description': 'Paiement par carte bancaire (Visa, Mastercard)',
            'actif': True,
            'icone': 'credit-card'
        },
        {
            'nom': 'Espèces',
            'code': 'ESPECECODE',
            'description': 'Paiement en espèces lors de la collecte ou livraison',
            'actif': True,
            'icone': 'banknote'
        },
        {
            'nom': 'Orange Money',
            'code': 'ORGANGEMONEYCODE',
            'description': 'Paiement mobile via Orange Money ou Maxit',
            'actif': True,
            'icone': 'smartphone'
        },
        {
            'nom': 'Wave',
            'code': 'WAVEMONEYCODE',
            'description': 'Paiement mobile via Wave',
            'actif': True,
            'icone': 'smartphone'
        },
    ]

    # Créer les moyens de paiement s'ils n'existent pas déjà
    for payment_data in default_payment_methods:
        MoyenPaiement.objects.get_or_create(
            code=payment_data['code'],
            defaults={
                'nom': payment_data['nom'],
                'description': payment_data['description'],
                'actif': payment_data['actif'],
                'icone': payment_data['icone']
            }
        )


def remove_default_payment_methods(apps, schema_editor):
    """
    Fonction de rollback: supprime les moyens de paiement par défaut.
    Note: Cette fonction ne sera probablement jamais utilisée en production.
    """
    MoyenPaiement = apps.get_model('commande', 'MoyenPaiement')

    # Codes des moyens de paiement par défaut
    default_codes = [
        'CARTEBACAIRECODE',
        'ESPECECODE',
        'ORGANGEMONEYCODE',
        'WAVEMONEYCODE'
    ]

    # Supprimer uniquement si aucune commande n'utilise ces moyens de paiement
    for code in default_codes:
        try:
            moyen = MoyenPaiement.objects.get(code=code)
            # Vérifier si des commandes utilisent ce moyen de paiement
            if moyen.commandes.count() == 0:
                moyen.delete()
        except MoyenPaiement.DoesNotExist:
            pass


class Migration(migrations.Migration):

    dependencies = [
        ('commande', '0006_alter_emaillog_type_email'),
    ]

    operations = [
        migrations.RunPython(
            add_default_payment_methods,
            reverse_code=remove_default_payment_methods
        ),
    ]
