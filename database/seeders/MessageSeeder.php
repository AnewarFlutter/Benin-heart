<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserMatch;
use App\Models\Message;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Messages entre Sophie et Marc
        $sophie = User::where('email', 'sophie@test.com')->first();
        $marc = User::where('email', 'marc@test.com')->first();

        if ($sophie && $marc) {
            $match = UserMatch::where(function ($query) use ($sophie, $marc) {
                $query->where('user_id', $sophie->id)->where('matched_user_id', $marc->id);
            })->orWhere(function ($query) use ($sophie, $marc) {
                $query->where('user_id', $marc->id)->where('matched_user_id', $sophie->id);
            })->first();

            if ($match) {
                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $marc->id,
                    'message_text' => 'Salut Sophie ! J\'ai vu que tu aimes la photographie, c\'est passionnant !',
                    'sent_at' => Carbon::now()->subHours(20),
                    'created_at' => Carbon::now()->subHours(20),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $sophie->id,
                    'message_text' => 'Salut Marc ! Oui j\'adore ça ! Et toi tu es développeur ?',
                    'sent_at' => Carbon::now()->subHours(19),
                    'created_at' => Carbon::now()->subHours(19),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $marc->id,
                    'message_text' => 'Exactement ! Je travaille sur des projets web. Tu as voyagé récemment ?',
                    'sent_at' => Carbon::now()->subHours(18),
                    'created_at' => Carbon::now()->subHours(18),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $sophie->id,
                    'message_text' => 'Oui, j\'étais en Espagne le mois dernier. C\'était magnifique !',
                    'sent_at' => Carbon::now()->subHours(17),
                    'created_at' => Carbon::now()->subHours(17),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $marc->id,
                    'message_text' => 'Super ! J\'aimerais beaucoup y aller. On pourrait en discuter autour d\'un café ?',
                    'sent_at' => Carbon::now()->subHours(16),
                    'created_at' => Carbon::now()->subHours(16),
                    'is_read' => false,
                ]);
            }
        }

        // Messages entre Emma et Thomas
        $emma = User::where('email', 'emma@test.com')->first();
        $thomas = User::where('email', 'thomas@test.com')->first();

        if ($emma && $thomas) {
            $match = UserMatch::where(function ($query) use ($emma, $thomas) {
                $query->where('user_id', $emma->id)->where('matched_user_id', $thomas->id);
            })->orWhere(function ($query) use ($emma, $thomas) {
                $query->where('user_id', $thomas->id)->where('matched_user_id', $emma->id);
            })->first();

            if ($match) {
                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $thomas->id,
                    'message_text' => 'Hello Emma ! Professeure de yoga, c\'est génial !',
                    'sent_at' => Carbon::now()->subHours(2),
                    'created_at' => Carbon::now()->subHours(2),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $emma->id,
                    'message_text' => 'Merci Thomas ! Tu es entrepreneur dans le digital ?',
                    'sent_at' => Carbon::now()->subHours(1),
                    'created_at' => Carbon::now()->subHours(1),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $thomas->id,
                    'message_text' => 'Oui, je développe des applications. Le yoga m\'intéresse beaucoup pour gérer le stress.',
                    'sent_at' => Carbon::now()->subMinutes(45),
                    'created_at' => Carbon::now()->subMinutes(45),
                    'is_read' => false,
                ]);
            }
        }

        // Messages entre Julie et Alexandre
        $julie = User::where('email', 'julie@test.com')->first();
        $alexandre = User::where('email', 'alexandre@test.com')->first();

        if ($julie && $alexandre) {
            $match = UserMatch::where(function ($query) use ($julie, $alexandre) {
                $query->where('user_id', $julie->id)->where('matched_user_id', $alexandre->id);
            })->orWhere(function ($query) use ($julie, $alexandre) {
                $query->where('user_id', $alexandre->id)->where('matched_user_id', $julie->id);
            })->first();

            if ($match) {
                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $alexandre->id,
                    'message_text' => 'Bonjour Julie ! Une artiste peintre, quelle belle profession !',
                    'sent_at' => Carbon::now()->subHours(3),
                    'created_at' => Carbon::now()->subHours(3),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $julie->id,
                    'message_text' => 'Merci Alexandre ! Chef cuisinier, ça doit être passionnant !',
                    'sent_at' => Carbon::now()->subHours(2)->subMinutes(30),
                    'created_at' => Carbon::now()->subHours(2)->subMinutes(30),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $alexandre->id,
                    'message_text' => 'Oui beaucoup ! Art et cuisine ont beaucoup en commun : la créativité !',
                    'sent_at' => Carbon::now()->subHours(2),
                    'created_at' => Carbon::now()->subHours(2),
                ]);

                Message::create([
                    'match_id' => $match->id,
                    'sender_id' => $julie->id,
                    'message_text' => 'Absolument ! Tu as un restaurant ?',
                    'sent_at' => Carbon::now()->subHours(1)->subMinutes(30),
                    'created_at' => Carbon::now()->subHours(1)->subMinutes(30),
                    'is_read' => false,
                ]);
            }
        }

        $this->command->info('Messages créés avec succès!');
    }
}
