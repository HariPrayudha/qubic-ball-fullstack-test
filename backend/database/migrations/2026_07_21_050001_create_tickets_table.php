<?php

use App\Enums\TicketStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('subject');
            $table->text('description');
            $table->string('status', 20)
                ->default(TicketStatus::Open->value)
                ->index();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            // Common access pattern: a user's tickets filtered by status.
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
