<?php

use App\Enums\UserRole;
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
        ArgSchema::create('users', function (ArgBlueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->argEnum(UserRole::class, 'role');
            $table->boolean('active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->addAuditColumns(true);
        });

        ArgSchema::create('password_reset_tokens', function (ArgBlueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        ArgSchema::create('sessions', function (ArgBlueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        ArgSchema::dropIfExists('users');
        ArgSchema::dropIfExists('password_reset_tokens');
        ArgSchema::dropIfExists('sessions');
    }
};
