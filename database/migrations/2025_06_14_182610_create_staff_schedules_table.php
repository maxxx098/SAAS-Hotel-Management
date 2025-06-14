<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('staff_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->time('shift_start');
            $table->time('shift_end');
            $table->time('break_start')->nullable();
            $table->time('break_end')->nullable();
            $table->enum('status', ['scheduled', 'on_duty', 'on_break', 'off_duty', 'absent'])->default('scheduled');
            $table->datetime('clock_in_time')->nullable();
            $table->datetime('clock_out_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['staff_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('staff_schedules');
    }
};