<?php

use App\Utils\ArgBlueprint;
use App\Utils\ArgMigration;
use App\Utils\ArgSchema;

return new class extends ArgMigration
{
    public function up(): void
    {
        ArgSchema::create('error_logs', function (ArgBlueprint $table) {
            $table->id();
            $table->string("url");
            $table->string("route")->nullable();
            $table->text("message")->nullable();
            $table->unsignedBigInteger("count")->default(1);
            $table->addAuditColumnsNoUser(false);
        });
    }
    public function down(): void
    {
        ArgSchema::dropIfExists('error_logs');
    }
};
