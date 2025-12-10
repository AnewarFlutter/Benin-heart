<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Swipe;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SwipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = User::where('is_verified', true)
            ->where('is_active', true)
            ->whereHas('role', function ($query) {
                $query->where('name', 'user');
            })
            ->get();

        if ($users->count() < 2) {
            $this->command->warn('Pas assez d\'utilisateurs pour créer des swipes');
            return;
        }

        // Sophie swipe sur plusieurs profils
        $sophie = User::where('email', 'sophie@test.com')->first();
        $marc = User::where('email', 'marc@test.com')->first();
        $thomas = User::where('email', 'thomas@test.com')->first();
        $alexandre = User::where('email', 'alexandre@test.com')->first();

        if ($sophie && $marc) {
            Swipe::updateOrCreate(
                ['from_user_id' => $sophie->id, 'to_user_id' => $marc->id],
                ['swipe_direction' => 'right', 'swiped_at' => Carbon::now()->subDays(2), 'created_at' => Carbon::now()->subDays(2)]
            );
        }

        if ($sophie && $thomas) {
            Swipe::updateOrCreate(
                ['from_user_id' => $sophie->id, 'to_user_id' => $thomas->id],
                ['swipe_direction' => 'right', 'swiped_at' => Carbon::now()->subDays(1), 'created_at' => Carbon::now()->subDays(1)]
            );
        }

        if ($sophie && $alexandre) {
            Swipe::updateOrCreate(
                ['from_user_id' => $sophie->id, 'to_user_id' => $alexandre->id],
                ['swipe_direction' => 'left', 'swiped_at' => Carbon::now()->subHours(12), 'created_at' => Carbon::now()->subHours(12)]
            );
        }

        // Marc swipe sur Sophie (match!)
        if ($marc && $sophie) {
            Swipe::updateOrCreate(
                ['from_user_id' => $marc->id, 'to_user_id' => $sophie->id],
                ['swipe_direction' => 'right', 'swiped_at' => Carbon::now()->subDays(1), 'created_at' => Carbon::now()->subDays(1)]
            );
        }

        // Emma swipe sur Marc et Thomas
        $emma = User::where('email', 'emma@test.com')->first();

        if ($emma && $marc) {
            Swipe::updateOrCreate(
                ['from_user_id' => $emma->id, 'to_user_id' => $marc->id],
                ['swipe_direction' => 'left', 'swiped_at' => Carbon::now()->subDays(3), 'created_at' => Carbon::now()->subDays(3)]
            );
        }

        if ($emma && $thomas) {
            Swipe::updateOrCreate(
                ['from_user_id' => $emma->id, 'to_user_id' => $thomas->id],
                ['swipe_direction' => 'right', 'swiped_at' => Carbon::now()->subHours(6), 'created_at' => Carbon::now()->subHours(6)]
            );
        }

        // Thomas swipe sur Emma (match!)
        if ($thomas && $emma) {
            Swipe::updateOrCreate(
                ['from_user_id' => $thomas->id, 'to_user_id' => $emma->id],
                ['swipe_direction' => 'right', 'swiped_at' => Carbon::now()->subHours(3), 'created_at' => Carbon::now()->subHours(3)]
            );
        }

        // Julie swipe sur plusieurs profils
        $julie = User::where('email', 'julie@test.com')->first();

        if ($julie && $marc) {
            Swipe::updateOrCreate(
                ['from_user_id' => $julie->id, 'to_user_id' => $marc->id],
                ['swipe_direction' => 'right', 'swiped_at' => Carbon::now()->subDays(4), 'created_at' => Carbon::now()->subDays(4)]
            );
        }

        if ($julie && $alexandre) {
            Swipe::updateOrCreate(
                ['from_user_id' => $julie->id, 'to_user_id' => $alexandre->id],
                ['swipe_direction' => 'right', 'swiped_at' => Carbon::now()->subHours(8), 'created_at' => Carbon::now()->subHours(8)]
            );
        }

        // Alexandre swipe sur Julie (match!)
        if ($alexandre && $julie) {
            Swipe::updateOrCreate(
                ['from_user_id' => $alexandre->id, 'to_user_id' => $julie->id],
                ['swipe_direction' => 'right', 'swiped_at' => Carbon::now()->subHours(4), 'created_at' => Carbon::now()->subHours(4)]
            );
        }

        // Thomas swipe sur Sophie
        if ($thomas && $sophie) {
            Swipe::updateOrCreate(
                ['from_user_id' => $thomas->id, 'to_user_id' => $sophie->id],
                ['swipe_direction' => 'left', 'swiped_at' => Carbon::now()->subDays(5), 'created_at' => Carbon::now()->subDays(5)]
            );
        }

        $this->command->info('Swipes créés avec succès!');
    }
}
