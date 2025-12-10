<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            SwipeSeeder::class,
            MatchSeeder::class,
            DiscoverySeeder::class,
            MessageSeeder::class,
            BlockSeeder::class,
            ReportSeeder::class,
        ]);
    }
}
