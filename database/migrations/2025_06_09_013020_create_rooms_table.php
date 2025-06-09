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
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};