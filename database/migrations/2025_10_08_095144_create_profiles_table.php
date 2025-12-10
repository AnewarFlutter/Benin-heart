<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->string('location_city')->nullable();
            $table->string('location_country')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('height')->nullable(); // en cm
            $table->string('occupation')->nullable();
            $table->string('education_level')->nullable();
            $table->string('relationship_status')->nullable();
            $table->string('relationship_goal')->nullable(); // long_term, casual, friendship
            $table->string('looking_for')->nullable();
            $table->json('interests')->nullable();
            $table->json('languages')->nullable();
            $table->string('profile_picture_url')->nullable();
            $table->boolean('is_profile_complete')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('profiles');
    }
};
