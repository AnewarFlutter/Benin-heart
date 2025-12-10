<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau Message</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 40px 30px;
        }
        .message-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .message-box p {
            color: #333;
            font-style: italic;
            margin: 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 Nouveau Message</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $recipientName }}</strong>,</p>
            <p>Vous avez reçu un nouveau message de <strong>{{ $senderName }}</strong> :</p>

            <div class="message-box">
                <p>"{{ $messagePreview }}"</p>
            </div>

            <a href="{{ config('app.url') }}/messages" class="btn">Répondre maintenant</a>

            <p style="margin-top: 30px; color: #888; font-size: 14px;">
                Astuce : Répondez rapidement pour maintenir la conversation active !
            </p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Dating App. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
    </div>
</body>
</html>
