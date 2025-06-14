<?php
// database/migrations/xxxx_create_staff_tasks_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('staff_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assigned_to')->constrained('users')->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('type', [
                'room_cleaning', 
                'maintenance', 
                'check_in', 
                'check_out', 
                'guest_service',
                'security_patrol',
                'general'
            ]);
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            
            // Task-specific data
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('maintenance_request_id')->nullable()->constrained()->onDelete('cascade');
            
            // Scheduling
            $table->date('scheduled_date')->nullable();
            $table->datetime('scheduled_at')->nullable();
            $table->datetime('started_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->integer('estimated_duration')->nullable(); // in minutes
            $table->integer('actual_duration')->nullable(); // in minutes
            
            // Additional metadata
            $table->json('metadata')->nullable(); // For storing additional task-specific data
            $table->text('notes')->nullable();
            $table->text('completion_notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['assigned_to', 'status']);
            $table->index(['type', 'status']);
            $table->index(['scheduled_at']);
            $table->index(['created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('staff_tasks');
    }
};