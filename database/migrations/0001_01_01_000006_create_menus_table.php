<?php

use App\Enums\MenuItemType;
use App\Models\Menu;
use App\Models\Post;
use App\Utils\ArgBlueprint;
use App\Utils\ArgMigration;
use App\Utils\ArgSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends ArgMigration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        ArgSchema::create('menus', function (ArgBlueprint $table) {
            $table->id();
            $table->json('title');
            $table->addAuditColumns(true);
        });
        ArgSchema::create('menu_items', function (ArgBlueprint $table) {
            $table->id();
            $table->foreignIdFor(Menu::class);
            $table->enum('type', MenuItemType::getValues());
            $table->json('title');
            $table->string('url')->nullable();
            $table->foreignIdFor(Post::class)->nullable();
            $table->unsignedTinyInteger('sequence');
            $table->addAuditColumns(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        ArgSchema::dropIfExists('menu_items');
        ArgSchema::dropIfExists('menus');
    }
};
