<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Photo;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DiscoverySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Crée des profils variés pour tester la fonctionnalité de découverte
     *
     * @return void
     */
    public function run()
    {
        $userRole = Role::where('name', 'user')->first();

        // Tableau de profils à créer pour la découverte
        $profiles = [
            [
                'user' => [
                    'email' => 'lea.durand@test.com',
                    'username' => 'lea_paris',
                    'first_name' => 'Léa',
                    'last_name' => 'Durand',
                    'date_of_birth' => '1996-04-15',
                    'gender' => 'female',
                    'phone_number' => '+33612340001',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Architecte d\'intérieur passionnée. J\'aime créer des espaces qui racontent une histoire. Fan de design scandinave et de vintage.',
                    'location_city' => 'Paris',
                    'location_country' => 'France',
                    'latitude' => 48.8566,
                    'longitude' => 2.3522,
                    'occupation' => 'Architecte d\'intérieur',
                    'education_level' => 'master',
                    'height' => 172,
                    'relationship_status' => 'single',
                    'looking_for' => 'relationship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'antoine.blanc@test.com',
                    'username' => 'antoine_lyon',
                    'first_name' => 'Antoine',
                    'last_name' => 'Blanc',
                    'date_of_birth' => '1994-08-22',
                    'gender' => 'male',
                    'phone_number' => '+33612340002',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Musicien et compositeur. La musique est ma vie! Guitariste dans un groupe de rock indie. Toujours en quête de nouvelles mélodies.',
                    'location_city' => 'Lyon',
                    'location_country' => 'France',
                    'latitude' => 45.7640,
                    'longitude' => 4.8357,
                    'occupation' => 'Musicien',
                    'education_level' => 'bachelor',
                    'height' => 180,
                    'relationship_status' => 'single',
                    'looking_for' => 'friendship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'clara.martin@test.com',
                    'username' => 'clara_bordeaux',
                    'first_name' => 'Clara',
                    'last_name' => 'Martin',
                    'date_of_birth' => '1998-01-10',
                    'gender' => 'female',
                    'phone_number' => '+33612340003',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Vétérinaire et amoureuse des animaux. Chaque jour est une aventure avec mes patients à quatre pattes. Adore la randonnée le week-end.',
                    'location_city' => 'Bordeaux',
                    'location_country' => 'France',
                    'latitude' => 44.8378,
                    'longitude' => -0.5792,
                    'occupation' => 'Vétérinaire',
                    'education_level' => 'doctorate',
                    'height' => 165,
                    'relationship_status' => 'single',
                    'looking_for' => 'relationship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'maxime.rousseau@test.com',
                    'username' => 'max_marseille',
                    'first_name' => 'Maxime',
                    'last_name' => 'Rousseau',
                    'date_of_birth' => '1995-11-30',
                    'gender' => 'male',
                    'phone_number' => '+33612340004',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Passionné de sports nautiques et de plongée. Instructeur de plongée certifié. La mer est mon terrain de jeu!',
                    'location_city' => 'Marseille',
                    'location_country' => 'France',
                    'latitude' => 43.2965,
                    'longitude' => 5.3698,
                    'occupation' => 'Instructeur de plongée',
                    'education_level' => 'vocational',
                    'height' => 183,
                    'relationship_status' => 'single',
                    'looking_for' => 'casual',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'amelie.garcia@test.com',
                    'username' => 'amelie_nice',
                    'first_name' => 'Amélie',
                    'last_name' => 'Garcia',
                    'date_of_birth' => '1997-06-18',
                    'gender' => 'female',
                    'phone_number' => '+33612340005',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Data scientist le jour, danseuse salsa la nuit. J\'aime jongler entre algorithmes et rythmes latinos. Prête pour de nouvelles aventures!',
                    'location_city' => 'Nice',
                    'location_country' => 'France',
                    'latitude' => 43.7102,
                    'longitude' => 7.2620,
                    'occupation' => 'Data Scientist',
                    'education_level' => 'master',
                    'height' => 168,
                    'relationship_status' => 'single',
                    'looking_for' => 'relationship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'lucas.bernard@test.com',
                    'username' => 'lucas_toulouse',
                    'first_name' => 'Lucas',
                    'last_name' => 'Bernard',
                    'date_of_birth' => '1993-03-25',
                    'gender' => 'male',
                    'phone_number' => '+33612340006',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Journaliste sportif et grand amateur de rugby. Toujours à la recherche de la prochaine grande histoire à raconter.',
                    'location_city' => 'Toulouse',
                    'location_country' => 'France',
                    'latitude' => 43.6047,
                    'longitude' => 1.4442,
                    'occupation' => 'Journaliste',
                    'education_level' => 'master',
                    'height' => 178,
                    'relationship_status' => 'single',
                    'looking_for' => 'friendship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'sarah.lopez@test.com',
                    'username' => 'sarah_nantes',
                    'first_name' => 'Sarah',
                    'last_name' => 'Lopez',
                    'date_of_birth' => '1999-09-08',
                    'gender' => 'female',
                    'phone_number' => '+33612340007',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Étudiante en médecine et bénévole humanitaire. Passionnée par la santé globale et les voyages solidaires.',
                    'location_city' => 'Nantes',
                    'location_country' => 'France',
                    'latitude' => 47.2184,
                    'longitude' => -1.5536,
                    'occupation' => 'Étudiante en médecine',
                    'education_level' => 'bachelor',
                    'height' => 170,
                    'relationship_status' => 'single',
                    'looking_for' => 'relationship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'nathan.petit@test.com',
                    'username' => 'nathan_strasbourg',
                    'first_name' => 'Nathan',
                    'last_name' => 'Petit',
                    'date_of_birth' => '1992-12-14',
                    'gender' => 'male',
                    'phone_number' => '+33612340008',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Chef pâtissier avec une passion pour les créations sucrées innovantes. Gagnant de plusieurs concours culinaires.',
                    'location_city' => 'Strasbourg',
                    'location_country' => 'France',
                    'latitude' => 48.5734,
                    'longitude' => 7.7521,
                    'occupation' => 'Chef Pâtissier',
                    'education_level' => 'vocational',
                    'height' => 175,
                    'relationship_status' => 'single',
                    'looking_for' => 'casual',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'alice.moreau@test.com',
                    'username' => 'alice_montpellier',
                    'first_name' => 'Alice',
                    'last_name' => 'Moreau',
                    'date_of_birth' => '1996-07-03',
                    'gender' => 'female',
                    'phone_number' => '+33612340009',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Avocate spécialisée en droit de l\'environnement. Militante écolo et passionnée de permaculture. Construisons un avenir durable ensemble!',
                    'location_city' => 'Montpellier',
                    'location_country' => 'France',
                    'latitude' => 43.6108,
                    'longitude' => 3.8767,
                    'occupation' => 'Avocate',
                    'education_level' => 'master',
                    'height' => 166,
                    'relationship_status' => 'single',
                    'looking_for' => 'relationship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'hugo.lambert@test.com',
                    'username' => 'hugo_lille',
                    'first_name' => 'Hugo',
                    'last_name' => 'Lambert',
                    'date_of_birth' => '1994-05-20',
                    'gender' => 'male',
                    'phone_number' => '+33612340010',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Game designer et créateur de jeux vidéo indépendants. Geek assumé et fan de culture pop. Toujours partant pour une game night!',
                    'location_city' => 'Lille',
                    'location_country' => 'France',
                    'latitude' => 50.6292,
                    'longitude' => 3.0573,
                    'occupation' => 'Game Designer',
                    'education_level' => 'bachelor',
                    'height' => 181,
                    'relationship_status' => 'single',
                    'looking_for' => 'friendship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'marie.fontaine@test.com',
                    'username' => 'marie_rennes',
                    'first_name' => 'Marie',
                    'last_name' => 'Fontaine',
                    'date_of_birth' => '1995-02-28',
                    'gender' => 'female',
                    'phone_number' => '+33612340011',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Professeure de français passionnée de littérature. J\'adore partager ma passion pour les mots et les histoires. Lectrice compulsive!',
                    'location_city' => 'Rennes',
                    'location_country' => 'France',
                    'latitude' => 48.1173,
                    'longitude' => -1.6778,
                    'occupation' => 'Professeure',
                    'education_level' => 'master',
                    'height' => 164,
                    'relationship_status' => 'single',
                    'looking_for' => 'relationship',
                    'is_profile_complete' => true,
                ]
            ],
            [
                'user' => [
                    'email' => 'theo.chevalier@test.com',
                    'username' => 'theo_grenoble',
                    'first_name' => 'Théo',
                    'last_name' => 'Chevalier',
                    'date_of_birth' => '1997-10-12',
                    'gender' => 'male',
                    'phone_number' => '+33612340012',
                    'nationality' => 'French',
                    'current_country' => 'France',
                ],
                'profile' => [
                    'bio' => 'Guide de montagne et moniteur de ski. La montagne, c\'est ma vie! Amoureux des grands espaces et des aventures en altitude.',
                    'location_city' => 'Grenoble',
                    'location_country' => 'France',
                    'latitude' => 45.1885,
                    'longitude' => 5.7245,
                    'occupation' => 'Guide de montagne',
                    'education_level' => 'vocational',
                    'height' => 186,
                    'relationship_status' => 'single',
                    'looking_for' => 'casual',
                    'is_profile_complete' => true,
                ]
            ],
        ];

        // Création des utilisateurs et profils
        foreach ($profiles as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['user']['email']],
                [
                    'username' => $data['user']['username'],
                    'password' => Hash::make('password123'),
                    'first_name' => $data['user']['first_name'],
                    'last_name' => $data['user']['last_name'],
                    'date_of_birth' => Carbon::parse($data['user']['date_of_birth']),
                    'gender' => $data['user']['gender'],
                    'phone_number' => $data['user']['phone_number'],
                    'nationality' => $data['user']['nationality'],
                    'current_country' => $data['user']['current_country'],
                    'is_verified' => true,
                    'is_active' => true,
                    'role_id' => $userRole->id,
                    'last_login' => Carbon::now()->subHours(rand(1, 72)),
                ]
            );

            Profile::updateOrCreate(
                ['user_id' => $user->id],
                $data['profile']
            );
        }

        $this->command->info('✓ ' . count($profiles) . ' profils de découverte créés avec succès!');
        $this->command->info('Tous les comptes utilisent le mot de passe: password123');
    }
}
