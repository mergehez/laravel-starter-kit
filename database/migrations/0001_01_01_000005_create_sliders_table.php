<?php

use App\Models\Slider;
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
        ArgSchema::create('sliders', function (ArgBlueprint $table) {
            $table->id();
            $table->json('title');
            $table->addAuditColumns(true);
        });
        ArgSchema::create('slider_items', function (ArgBlueprint $table) {
            $table->id();
            $table->foreignIdFor(Slider::class);
            $table->json('title');
            $table->json('subtitle');
            $table->string('image_url');
            $table->string('url');
            $table->string('text_color');
            $table->string('bg_color');
            $table->unsignedTinyInteger('sequence');
            $table->boolean('is_active')->default(true);
            $table->addAuditColumns(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        ArgSchema::dropIfExists('slider_items');
        ArgSchema::dropIfExists('sliders');
    }
};
