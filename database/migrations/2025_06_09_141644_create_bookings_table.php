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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('check_in_completed')->default(false);
            $table->boolean('check_out_completed')->default(false);
            $table->datetime('actual_check_in')->nullable();
            $table->datetime('actual_check_out')->nullable();
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('checked_out_by')->nullable()->constrained('users')->onDelete('set null');
            // Guest information
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone')->nullable();
            
            // Booking details
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('adults')->default(1);
            $table->integer('children')->default(0);
            
            // Room and pricing
            $table->string('room_type');
            $table->decimal('room_price', 10, 2);
            $table->decimal('total_amount', 10, 2);
            
            // Status and metadata
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->text('special_requests')->nullable();
            $table->string('booking_source')->default('website'); // website, phone, mobile_app, etc.
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'created_at']);
            $table->index(['check_in', 'check_out']);
            $table->index('guest_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};