<?php

use App\Utils\ArgBlueprint;
use App\Utils\ArgMigration;
use App\Utils\ArgSchema;

return new class extends ArgMigration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        ArgSchema::create('cache', function (ArgBlueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        ArgSchema::create('cache_locks', function (ArgBlueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        ArgSchema::dropIfExists('cache');
        ArgSchema::dropIfExists('cache_locks');
    }
};
