@props([
    'websiteInfo' => null,
    'theme' => 'dark',
])

<?php
$seo = $page['props']['seo'] ?? null;
$lang = app()->getLocale();
$lang = $lang == 'kmr' || $lang == 'zza' || $lang == 'ckb' ? 'ku' : $lang;
if ($seo) {
    $title = $seo['title'];
    $description = str_replace(["\r\n", "\n", "<br>"], ' ', $seo['description']);
    $url = $seo['url'] ?: url()->current();
} else {
    $title = $websiteInfo[\App\Enums\KeyValueKey::siteTitle];
    $description = $websiteInfo[\App\Enums\KeyValueKey::siteDesc];
    $url = url()->current();
}
if (!str_contains($url, 'www.')) {
    $url = str_replace('http://', 'http://www.', $url);
    $url = str_replace('https://', 'https://www.', $url);
}

$faviconFolder = 'favicon';
$logoUrl = '/logo/logo.png';
?>


<meta name="title" content="{{$title}}"/>
<meta property="og:title" content="{{$title}}"/>
<meta name="twitter:title" content="{{$title}}"/>
<meta name="apple-mobile-web-app-title" content="{{$title}}"/>
<meta name="og:image:alt" content="{{$title}}"/>
<title>{{ $title }}</title>

<meta name="description" content="{{$description}}"/>
<meta property="og:description" content="{{$description}}"/>
<meta name="twitter:description" content="{{$description}}"/>
<meta name="abstract" content="{{$description}}"/>

@if($seo && isset($seo['image_url']))
    <meta property="og:image" content="{{$seo['image_url']}}"/>
    <meta name="twitter:image" content="{{$seo['image_url']}}"/>
@else
    <meta property="og:image" content="{{$logoUrl}}"/>
    <meta name="twitter:image" content="{{$logoUrl}}"/>
@endif
@if($seo && isset($seo['created_at']))
    <meta name="date" content="{{$seo['created_at']}}"/>
@endif
@if($seo && isset($seo['updated_at']))
    <meta name="last-modified" content="{{$seo['updated_at']}}"/>
    <meta name="revised" content="{{$seo['updated_at']}}"/>
    <meta property="article:modified_time" content="{{$seo['updated_at']}}"/>
    <meta name="og:modified_time" content="{{$seo['updated_at']}}"/>
@endif
@if($seo && isset($seo['published_at']))
    <meta name="publish_date" content="{{$seo['published_at']}}"/>
    <meta property="article:published_time" content="{{$seo['published_at']}}"/>
@endif

<!-- seo ld+json -->
<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "headline": "{{ $title }}",
          "description": "{{ $description }}",
          "publisher": {
            "@type": "Organization",
            "name": "{{ $websiteInfo[\App\Enums\KeyValueKey::siteTitle] }}",
            "logo": {
              "@type": "ImageObject",
                "url": "{{ $logoUrl }}"
            }
          },
    @if($seo && isset($seo['created_at']))
        "datePublished": "{{$seo['created_at']}}",
    @endif
    @if($seo && isset($seo['updated_at']))
        "dateModified": "{{$seo['updated_at']}}",
    @endif

    "image": {
      "@type": "ImageObject",
    @if($seo && isset($seo['image_url']))
        "url": "{{ $seo['image_url'] }}"
    @else
        "url": "{{ $logoUrl }}"
    @endif
    },
    "keywords": "{{ $seo ? $seo['keywords'] ?? '' : '' }}",
        "inLanguage": "{{ $lang }}"
      }
</script>

<meta property="og:url" content="{{$url}}"/>
<meta name="twitter:url" content="{{$url}}"/>
<meta name="twitter:card" content="summary"/>
<meta name="og:site_name" content="{{$websiteInfo[\App\Enums\KeyValueKey::siteTitle]}}"/>
<meta name="og:type" content="website"/>
<meta name="og:locale" content="{{$lang}}"/>
<meta name="og:locale:alternate" content="en"/>
<meta name="og:locale:alternate" content="tr"/>
<meta name="og:locale:alternate" content="de"/>
<meta name="og:locale:alternate" content="kmr"/>
<meta name="og:locale:alternate" content="zza"/>
<link rel="canonical" href="{{$url}}"/>

<link rel="apple-touch-icon" sizes="57x57" href="/{{$faviconFolder}}/apple-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="/{{$faviconFolder}}/apple-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="/{{$faviconFolder}}/apple-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="/{{$faviconFolder}}/apple-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="/{{$faviconFolder}}/apple-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="/{{$faviconFolder}}/apple-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="/{{$faviconFolder}}/apple-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="/{{$faviconFolder}}/apple-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/{{$faviconFolder}}/apple-icon-180x180.png">
<link rel="icon" type="image/png" sizes="192x192" href="/{{$faviconFolder}}/android-icon-192x192.png">
<link rel="shortcut" type="image/x-icon" href="/{{$faviconFolder}}/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/{{$faviconFolder}}/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="96x96" href="/{{$faviconFolder}}/favicon-96x96.png">
<link rel="icon" type="image/png" sizes="16x16" href="/{{$faviconFolder}}/favicon-16x16.png">
<link rel="manifest" href="/{{$faviconFolder}}/manifest.json">

<meta name="msapplication-TileColor" content="#ffffff">
<meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
<meta name="theme-color" content="#ffffff">

<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#da532c">
<meta name="msapplication-TileColor" content="#da532c">
<meta name="theme-color" content="#ffffff">
<meta name="theme" content="{{$theme}}">