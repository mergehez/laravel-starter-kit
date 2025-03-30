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
        ArgSchema::create('key_values', function (ArgBlueprint $table) {
            $table->id();
            $table->string('key')->unique(); // see app/Enums/KeyValues.php
            $table->text('value');
            $table->addAuditColumnsNoUser(false);
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        ArgSchema::dropIfExists('key_values');
    }
};
