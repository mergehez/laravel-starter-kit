<?php

use App\Utils\ArgBlueprint;
use App\Utils\ArgMigration;
use App\Utils\ArgSchema;

return new class extends ArgMigration {
    public function up(): void
    {
        ArgSchema::create('seos', function (ArgBlueprint $table) {
            $table->id();
            $table->json('title')->nullable();
            $table->json('description')->nullable();
            $table->json('keywords')->nullable();
            $table->string('image_url')->nullable();
            $table->addAuditColumns(false);
        });
    }

    public function down(): void
    {
        ArgSchema::dropIfExists('seos');
    }
};
