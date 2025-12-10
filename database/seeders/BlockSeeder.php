<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Block;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class BlockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Sophie bloque un utilisateur désactivé (Pierre)
        $sophie = User::where('email', 'sophie@test.com')->first();
        $pierre = User::where('email', 'pierre@test.com')->first();

        if ($sophie && $pierre) {
            Block::updateOrCreate(
                ['blocker_user_id' => $sophie->id, 'blocked_user_id' => $pierre->id],
                ['reason' => 'Comportement inapproprié', 'blocked_at' => Carbon::now()->subDays(5), 'created_at' => Carbon::now()->subDays(5)]
            );
        }

        // Marc bloque quelqu'un
        $marc = User::where('email', 'marc@test.com')->first();
        $alexandre = User::where('email', 'alexandre@test.com')->first();

        if ($marc && $alexandre) {
            Block::updateOrCreate(
                ['blocker_user_id' => $marc->id, 'blocked_user_id' => $alexandre->id],
                ['reason' => 'Pas d\'affinité', 'blocked_at' => Carbon::now()->subDays(3), 'created_at' => Carbon::now()->subDays(3)]
            );
        }

        $this->command->info('Blocages créés avec succès!');
    }
}
