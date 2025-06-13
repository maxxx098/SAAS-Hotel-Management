<?php

// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin User
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('adminpassword'), // secure password
            'role' => 'admin',
            'department' => 'Management',
            'employee_id' => 'EMP-0001',
        ]);

        // Regular User
        User::factory()->create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('userpassword'),
            'role' => 'user',
        ]);

        User::factory()->create([
            'name' => 'Regular User',
            'email' => 'symonfalcatan08@gmail.com',
            'password' => Hash::make('userpassword'),
            'role' => 'user',
        ]);

        // Staff Users
        User::factory()->create([
            'name' => 'Front Desk Staff',
            'email' => 'frontdesk@example.com',
            'password' => Hash::make('staffpassword'),
            'role' => 'front_desk',
            'department' => 'Front Desk',
            'employee_id' => 'EMP-0002',
            'phone' => '+1234567890',
        ]);

        User::factory()->create([
            'name' => 'Housekeeping Staff',
            'email' => 'housekeeping@example.com',
            'password' => Hash::make('staffpassword'),
            'role' => 'housekeeping',
            'department' => 'Housekeeping',
            'employee_id' => 'EMP-0003',
            'phone' => '+1234567891',
        ]);

        User::factory()->create([
            'name' => 'Maintenance Staff',
            'email' => 'maintenance@example.com',
            'password' => Hash::make('staffpassword'),
            'role' => 'maintenance',
            'department' => 'Maintenance',
            'employee_id' => 'EMP-0004',
            'phone' => '+1234567892',
        ]);

        User::factory()->create([
            'name' => 'Security Staff',
            'email' => 'security@example.com',
            'password' => Hash::make('staffpassword'),
            'role' => 'security',
            'department' => 'Security',
            'employee_id' => 'EMP-0005',
            'phone' => '+1234567893',
        ]);

        User::factory()->create([
            'name' => 'General Staff',
            'email' => 'staff@example.com',
            'password' => Hash::make('staffpassword'),
            'role' => 'staff',
            'department' => 'General',
            'employee_id' => 'EMP-0006',
            'phone' => '+1234567894',
        ]);

        // Optionally create more users
        // User::factory(10)->create();
    }
}