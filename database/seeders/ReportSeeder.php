<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Report;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Emma signale un utilisateur pour spam
        $emma = User::where('email', 'emma@test.com')->first();
        $pierre = User::where('email', 'pierre@test.com')->first();

        if ($emma && $pierre) {
            Report::create([
                'reporter_user_id' => $emma->id,
                'reported_user_id' => $pierre->id,
                'reason' => 'spam',
                'description' => 'Envoie des messages non sollicités de manière répétitive',
                'status' => 'pending',
                'reported_at' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(2),
            ]);
        }

        // Thomas signale un utilisateur pour contenu inapproprié
        $thomas = User::where('email', 'thomas@test.com')->first();
        $alexandre = User::where('email', 'alexandre@test.com')->first();

        if ($thomas && $alexandre) {
            Report::create([
                'reporter_user_id' => $thomas->id,
                'reported_user_id' => $alexandre->id,
                'reason' => 'inappropriate_content',
                'description' => 'Photos de profil inappropriées',
                'status' => 'reviewed',
                'reported_at' => Carbon::now()->subHours(12),
                'created_at' => Carbon::now()->subHours(12),
            ]);
        }

        // Julie signale pour faux profil
        $julie = User::where('email', 'julie@test.com')->first();
        $marc = User::where('email', 'marc@test.com')->first();

        if ($julie && $marc) {
            Report::create([
                'reporter_user_id' => $julie->id,
                'reported_user_id' => $marc->id,
                'reason' => 'fake_profile',
                'description' => 'Photos semblent provenir d\'internet',
                'status' => 'resolved',
                'reported_at' => Carbon::now()->subDays(5),
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(4),
            ]);
        }

        // Sophie signale pour harcèlement
        $sophie = User::where('email', 'sophie@test.com')->first();

        if ($sophie && $pierre) {
            Report::create([
                'reporter_user_id' => $sophie->id,
                'reported_user_id' => $pierre->id,
                'reason' => 'harassment',
                'description' => 'Messages insistants malgré refus',
                'status' => 'resolved',
                'reported_at' => Carbon::now()->subDays(6),
                'created_at' => Carbon::now()->subDays(6),
                'updated_at' => Carbon::now()->subDays(5),
            ]);
        }

        $this->command->info('Signalements créés avec succès!');
    }
}
