<?php

use App\Enums\PostStatus;
use App\Enums\PostType;
use App\Models\Seo;
use App\Utils\ArgBlueprint;
use App\Utils\ArgMigration;
use App\Utils\ArgSchema;
use Illuminate\Support\Facades\DB;

return new class extends ArgMigration {
    public function up(): void
    {
        ArgSchema::create('posts', function (ArgBlueprint $table) {
            $table->id();
            $table->json('title');
            $table->string('slug')->unique();
            $table->json('excerpt');
            $table->json('content');
            // $table->json('content_tiptap')->default(DB::raw('(json_object())'));
            $table->json('tags');
            $table->enum('status', PostStatus::getValues())->default(PostStatus::draft);
            $table->enum('type', PostType::getValues());
            $table->string('image_url')->nullable();
            $table->timestampInt('published_at')->nullable();
            $table->timestampInt('date_from')->nullable();
            $table->timestampInt('date_to')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->json('data')->nullable();
            $table->foreignIdFor(Seo::class);
            $table->addAuditColumns(true);
        });
    }

    public function down(): void
    {
        ArgSchema::dropIfExists('posts');
    }
};
