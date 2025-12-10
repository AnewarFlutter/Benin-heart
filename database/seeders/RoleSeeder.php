<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrateur',
                'description' => 'Accès complet à la plateforme'
            ],
            [
                'name' => 'user',
                'display_name' => 'Utilisateur',
                'description' => 'Utilisateur standard'
            ],
            [
                'name' => 'moderator',
                'display_name' => 'Modérateur',
                'description' => 'Modération des contenus et utilisateurs'
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
