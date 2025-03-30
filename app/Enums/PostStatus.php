<?php

namespace App\Enums;

class PostStatus extends ArgBaseEnum
{
    const string draft = 'draft';
    const string published = 'publish';
    const string archived = 'archived';

}