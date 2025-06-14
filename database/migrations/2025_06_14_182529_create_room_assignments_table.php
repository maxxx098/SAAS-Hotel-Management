<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('room_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->date('assigned_date');
            $table->enum('status', ['assigned', 'in_progress', 'completed', 'skipped'])->default('assigned');
            $table->enum('cleaning_type', ['checkout', 'maintenance', 'deep_clean', 'inspection'])->default('checkout');
            $table->datetime('started_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('checklist_items')->nullable(); // Store cleaning checklist completion
            $table->timestamps();
            
            $table->unique(['room_id', 'staff_id', 'assigned_date']);
            $table->index(['staff_id', 'assigned_date']);
            $table->index(['assigned_date', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('room_assignments');
    }
};
