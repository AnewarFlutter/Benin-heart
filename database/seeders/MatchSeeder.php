<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserMatch;
use App\Models\Like;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Match 1: Sophie ❤️ Marc
        $sophie = User::where('email', 'sophie@test.com')->first();
        $marc = User::where('email', 'marc@test.com')->first();

        if ($sophie && $marc) {
            // Créer le like si nécessaire
            $like = Like::firstOrCreate([
                'from_user_id' => $sophie->id,
                'to_user_id' => $marc->id,
            ], [
                'status' => 'accepted',
                'created_at' => Carbon::now()->subDays(1),
            ]);

            UserMatch::updateOrCreate(
                [
                    'user_id' => $sophie->id < $marc->id ? $sophie->id : $marc->id,
                    'matched_user_id' => $sophie->id < $marc->id ? $marc->id : $sophie->id,
                ],
                [
                    'like_id' => $like->id,
                    'status' => 'active',
                    'matched_at' => Carbon::now()->subDays(1),
                ]
            );
        }

        // Match 2: Emma ❤️ Thomas
        $emma = User::where('email', 'emma@test.com')->first();
        $thomas = User::where('email', 'thomas@test.com')->first();

        if ($emma && $thomas) {
            // Créer le like si nécessaire
            $like = Like::firstOrCreate([
                'from_user_id' => $emma->id,
                'to_user_id' => $thomas->id,
            ], [
                'status' => 'accepted',
                'created_at' => Carbon::now()->subHours(3),
            ]);

            UserMatch::updateOrCreate(
                [
                    'user_id' => $emma->id < $thomas->id ? $emma->id : $thomas->id,
                    'matched_user_id' => $emma->id < $thomas->id ? $thomas->id : $emma->id,
                ],
                [
                    'like_id' => $like->id,
                    'status' => 'active',
                    'matched_at' => Carbon::now()->subHours(3),
                ]
            );
        }

        // Match 3: Julie ❤️ Alexandre
        $julie = User::where('email', 'julie@test.com')->first();
        $alexandre = User::where('email', 'alexandre@test.com')->first();

        if ($julie && $alexandre) {
            // Créer le like si nécessaire
            $like = Like::firstOrCreate([
                'from_user_id' => $julie->id,
                'to_user_id' => $alexandre->id,
            ], [
                'status' => 'accepted',
                'created_at' => Carbon::now()->subHours(4),
            ]);

            UserMatch::updateOrCreate(
                [
                    'user_id' => $julie->id < $alexandre->id ? $julie->id : $alexandre->id,
                    'matched_user_id' => $julie->id < $alexandre->id ? $alexandre->id : $julie->id,
                ],
                [
                    'like_id' => $like->id,
                    'status' => 'active',
                    'matched_at' => Carbon::now()->subHours(4),
                ]
            );
        }

        $this->command->info('Matches créés avec succès!');
    }
}
