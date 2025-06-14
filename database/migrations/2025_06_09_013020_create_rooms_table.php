<?php
// Create this migration: php artisan make:migration create_rooms_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique(); // Room number (e.g., "101", "A-205")
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type'); // single, double, suite, etc.
            $table->decimal('price_per_night', 8, 2);
            $table->integer('capacity'); // max number of guests
            $table->integer('beds')->default(1);
            $table->decimal('size', 8, 2)->nullable(); // room size in sqm
            $table->json('amenities')->nullable(); // wifi, ac, tv, etc.
            $table->json('images')->nullable(); // array of image URLs
            $table->boolean('is_available')->default(true);
            $table->boolean('is_active')->default(true);
            $table->enum('status', [
                'available',
                'occupied',
                'maintenance',
                'out_of_order'
            ])->default('available'); // Added status column
            $table->enum('cleaning_status', [
                'clean', 
                'dirty', 
                'out_of_order', 
                'in_progress', 
                'inspection_required'
            ])->default('clean');
            $table->datetime('last_cleaned')->nullable();
            $table->foreignId('last_cleaned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};