<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketResponse;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a predictable set of
     * accounts and sample tickets for local development / review.
     */
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@qubic.test',
            'password' => Hash::make('password'),
        ]);

        $alice = User::factory()->create([
            'name' => 'Alice Customer',
            'email' => 'alice@qubic.test',
            'password' => Hash::make('password'),
        ]);

        $bob = User::factory()->create([
            'name' => 'Bob Customer',
            'email' => 'bob@qubic.test',
            'password' => Hash::make('password'),
        ]);

        // Alice: a mix of statuses, with an admin response on the resolved one.
        Ticket::factory()->for($alice)->create([
            'subject' => 'Cannot log in to my account',
            'description' => 'I keep getting an "invalid credentials" error even with the correct password.',
        ]);

        Ticket::factory()->for($alice)->inProgress()->create([
            'subject' => 'Billing charged twice this month',
            'description' => 'My card was charged two times for the same subscription on July 3rd.',
        ]);

        $resolved = Ticket::factory()->for($alice)->resolved()->create([
            'subject' => 'How do I export my data?',
            'description' => 'I would like to download all of my tickets as a CSV file.',
        ]);

        TicketResponse::factory()->for($resolved)->create([
            'user_id' => $admin->id,
            'message' => 'You can export your data from Settings → Export. Marking this as resolved.',
        ]);

        // Bob: a couple of tickets.
        Ticket::factory()->for($bob)->create([
            'subject' => 'Feature request: dark mode',
            'description' => 'It would be great to have a dark theme for the dashboard.',
        ]);

        Ticket::factory()->for($bob)->inProgress()->create([
            'subject' => 'App is slow on mobile',
            'description' => 'The ticket list takes several seconds to load on my phone.',
        ]);
    }
}
