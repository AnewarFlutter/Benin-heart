<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Photo;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Récupérer les rôles
        $adminRole = Role::where('name', 'admin')->first();
        $userRole = Role::where('name', 'user')->first();
        $moderatorRole = Role::where('name', 'moderator')->first();

        // ========== ADMINISTRATEUR ==========
        $admin = User::updateOrCreate(
            ['email' => 'admin@dating.com'],
            [
                'username' => 'admin',
                'password' => Hash::make('password123'),
                'first_name' => 'Admin',
                'last_name' => 'System',
                'date_of_birth' => Carbon::parse('1990-01-01'),
                'gender' => 'other',
                'phone_number' => '+33612345678',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => true,
                'role_id' => $adminRole->id,
                'last_login' => Carbon::now(),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $admin->id],
            [
                'bio' => 'Administrateur de la plateforme',
                'occupation' => 'Administrateur système',
                'education_level' => 'master',
                'height' => 180,
            ]
        );

        // ========== MODÉRATEUR ==========
        $moderator = User::updateOrCreate(
            ['email' => 'moderator@dating.com'],
            [
                'username' => 'moderator',
                'password' => Hash::make('password123'),
                'first_name' => 'John',
                'last_name' => 'Moderator',
                'date_of_birth' => Carbon::parse('1992-05-15'),
                'gender' => 'male',
                'phone_number' => '+33623456789',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => true,
                'role_id' => $moderatorRole->id,
                'last_login' => Carbon::now(),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $moderator->id],
            [
                'bio' => 'Modérateur de contenu',
                'occupation' => 'Modérateur',
                'education_level' => 'bachelor',
                'height' => 175,
            ]
        );

        // ========== UTILISATEURS TEST ==========

        // Utilisateur 1 - Sophie
        $sophie = User::updateOrCreate(
            ['email' => 'sophie@test.com'],
            [
                'username' => 'sophie_paris',
                'password' => Hash::make('password123'),
                'first_name' => 'Sophie',
                'last_name' => 'Martin',
                'date_of_birth' => Carbon::parse('1995-03-20'),
                'gender' => 'female',
                'phone_number' => '+33634567890',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => true,
                'role_id' => $userRole->id,
                'last_login' => Carbon::now()->subDays(1),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $sophie->id],
            [
                'bio' => 'Passionnée de voyages et de photographie. J\'adore découvrir de nouveaux endroits et rencontrer des gens intéressants.',
                'occupation' => 'Photographe',
                'education_level' => 'bachelor',
                'height' => 165,
                'interests' => json_encode(['Photographie', 'Voyages', 'Yoga', 'Cuisine', 'Cinéma']),
                'languages' => json_encode(['Français', 'Anglais', 'Espagnol']),
            ]
        );

        // Utilisateur 2 - Marc
        $marc = User::updateOrCreate(
            ['email' => 'marc@test.com'],
            [
                'username' => 'marc_lyon',
                'password' => Hash::make('password123'),
                'first_name' => 'Marc',
                'last_name' => 'Dubois',
                'date_of_birth' => Carbon::parse('1993-07-12'),
                'gender' => 'male',
                'phone_number' => '+33645678901',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => true,
                'role_id' => $userRole->id,
                'last_login' => Carbon::now()->subHours(3),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $marc->id],
            [
                'bio' => 'Développeur passionné de tech et de sport. Toujours prêt pour une nouvelle aventure!',
                'occupation' => 'Développeur Web',
                'education_level' => 'master',
                'height' => 182,
                'interests' => json_encode(['Programmation', 'Sport', 'Randonnée', 'Gaming', 'Lecture']),
                'languages' => json_encode(['Français', 'Anglais']),
            ]
        );

        // Utilisateur 3 - Emma
        $emma = User::updateOrCreate(
            ['email' => 'emma@test.com'],
            [
                'username' => 'emma_bordeaux',
                'password' => Hash::make('password123'),
                'first_name' => 'Emma',
                'last_name' => 'Leroy',
                'date_of_birth' => Carbon::parse('1997-11-08'),
                'gender' => 'female',
                'phone_number' => '+33656789012',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => true,
                'role_id' => $userRole->id,
                'last_login' => Carbon::now()->subMinutes(30),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $emma->id],
            [
                'bio' => 'Amoureuse de la nature et des animaux. Professeure de yoga et adepte du bien-être.',
                'occupation' => 'Professeure de Yoga',
                'education_level' => 'bachelor',
                'height' => 170,
                'interests' => json_encode(['Yoga', 'Méditation', 'Nature', 'Animaux', 'Musique']),
                'languages' => json_encode(['Français', 'Anglais', 'Italien']),
            ]
        );

        // Utilisateur 4 - Thomas
        $thomas = User::updateOrCreate(
            ['email' => 'thomas@test.com'],
            [
                'username' => 'thomas_marseille',
                'password' => Hash::make('password123'),
                'first_name' => 'Thomas',
                'last_name' => 'Bernard',
                'date_of_birth' => Carbon::parse('1994-02-25'),
                'gender' => 'male',
                'phone_number' => '+33667890123',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => true,
                'role_id' => $userRole->id,
                'last_login' => Carbon::now()->subDays(2),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $thomas->id],
            [
                'bio' => 'Entrepreneur dans le digital. Passionné par l\'innovation et les nouvelles technologies.',
                'occupation' => 'Entrepreneur',
                'education_level' => 'master',
                'height' => 178,
                'interests' => json_encode(['Entrepreneuriat', 'Tech', 'Surf', 'Voyages', 'Cuisine']),
                'languages' => json_encode(['Français', 'Anglais', 'Allemand']),
            ]
        );

        // Utilisateur 5 - Julie
        $julie = User::updateOrCreate(
            ['email' => 'julie@test.com'],
            [
                'username' => 'julie_nice',
                'password' => Hash::make('password123'),
                'first_name' => 'Julie',
                'last_name' => 'Petit',
                'date_of_birth' => Carbon::parse('1996-09-17'),
                'gender' => 'female',
                'phone_number' => '+33678901234',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => true,
                'role_id' => $userRole->id,
                'last_login' => Carbon::now()->subHours(12),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $julie->id],
            [
                'bio' => 'Artiste peintre et passionnée d\'art contemporain. Toujours à la recherche de nouvelles inspirations.',
                'occupation' => 'Artiste Peintre',
                'education_level' => 'bachelor',
                'height' => 168,
                'interests' => json_encode(['Art', 'Peinture', 'Musées', 'Danse', 'Théâtre']),
                'languages' => json_encode(['Français', 'Anglais']),
            ]
        );

        // Utilisateur 6 - Alexandre
        $alexandre = User::updateOrCreate(
            ['email' => 'alexandre@test.com'],
            [
                'username' => 'alex_toulouse',
                'password' => Hash::make('password123'),
                'first_name' => 'Alexandre',
                'last_name' => 'Roux',
                'date_of_birth' => Carbon::parse('1992-06-30'),
                'gender' => 'male',
                'phone_number' => '+33689012345',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => true,
                'role_id' => $userRole->id,
                'last_login' => Carbon::now()->subDays(3),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $alexandre->id],
            [
                'bio' => 'Chef cuisinier passionné par la gastronomie française. Amateur de bons vins et de bonne compagnie.',
                'occupation' => 'Chef Cuisinier',
                'education_level' => 'vocational',
                'height' => 185,
                'interests' => json_encode(['Cuisine', 'Gastronomie', 'Vin', 'Voyages', 'Musique']),
                'languages' => json_encode(['Français', 'Anglais', 'Italien']),
            ]
        );

        // Utilisateur 7 - Camille (Non vérifié pour tester)
        $camille = User::updateOrCreate(
            ['email' => 'camille@test.com'],
            [
                'username' => 'camille_lille',
                'password' => Hash::make('password123'),
                'first_name' => 'Camille',
                'last_name' => 'Moreau',
                'date_of_birth' => Carbon::parse('1998-12-05'),
                'gender' => 'female',
                'phone_number' => '+33690123456',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => false,
                'is_active' => true,
                'role_id' => $userRole->id,
                'otp' => '1234',
                'otp_expired_at' => Carbon::now()->addMinutes(10),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $camille->id],
            [
                'bio' => 'Compte en attente de vérification',
                'occupation' => 'Étudiante',
                'education_level' => 'bachelor',
                'height' => 163,
            ]
        );

        // Utilisateur 8 - Pierre (Désactivé pour tester)
        $pierre = User::updateOrCreate(
            ['email' => 'pierre@test.com'],
            [
                'username' => 'pierre_nantes',
                'password' => Hash::make('password123'),
                'first_name' => 'Pierre',
                'last_name' => 'Simon',
                'date_of_birth' => Carbon::parse('1991-04-18'),
                'gender' => 'male',
                'phone_number' => '+33601234567',
                'nationality' => 'French',
                'current_country' => 'France',
                'is_verified' => true,
                'is_active' => false,
                'role_id' => $userRole->id,
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $pierre->id],
            [
                'bio' => 'Compte désactivé',
                'occupation' => 'Architecte',
                'education_level' => 'master',
                'height' => 177,
            ]
        );

        $this->command->info('Users et profiles créés avec succès!');
        $this->command->info('Comptes de test:');
        $this->command->info('- Admin: admin@dating.com / password123');
        $this->command->info('- Moderator: moderator@dating.com / password123');
        $this->command->info('- Users: sophie@test.com, marc@test.com, emma@test.com, etc. / password123');
    }
}
