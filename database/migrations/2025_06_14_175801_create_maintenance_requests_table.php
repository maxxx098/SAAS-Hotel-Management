<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'])->default('pending');
            $table->string('location')->nullable();
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('estimated_time')->nullable()->comment('Estimated time in minutes');
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->enum('category', [
                'plumbing',
                'electrical', 
                'hvac',
                'carpentry',
                'painting',
                'cleaning',
                'appliance',
                'furniture',
                'security',
                'other'
            ])->default('other');
            $table->timestamps();

            // Indexes for better performance
            $table->index(['status', 'priority']);
            $table->index(['assigned_to', 'status']);
            $table->index(['room_id', 'status']);
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
};