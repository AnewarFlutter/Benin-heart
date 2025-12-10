<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau Match</title>
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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .match-card {
            background-color: #fff5f8;
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
        }
        .match-card h2 {
            color: #f5576c;
            margin: 10px 0;
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
            padding: 15px 40px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 25px;
            margin-top: 20px;
            font-weight: bold;
        }
        .emoji {
            font-size: 60px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💕 Nouveau Match !</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $recipientName }}</strong>,</p>

            <div class="emoji">🎉</div>

            <div class="match-card">
                <h2>Félicitations !</h2>
                <p>Vous avez un nouveau match avec</p>
                <h2>{{ $matchedUser->first_name }}</h2>
                <p style="color: #666; margin-top: 20px;">
                    Vous pouvez maintenant commencer une conversation !
                </p>
            </div>

            <a href="{{ config('app.url') }}/matches" class="btn">Voir le profil</a>

            <p style="margin-top: 30px; color: #888;">
                N'attendez pas trop longtemps pour envoyer un message !
            </p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Dating App. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
    </div>
</body>
</html>
