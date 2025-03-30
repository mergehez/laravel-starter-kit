<?php

namespace App\Http\Controllers;

use App\Utils\MediaLibConfig;
use App\Utils\MediaLibConfigSize;
use App\Utils\MediaLibFile;
use Arr;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Encoders\AutoEncoder;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\Laravel\Facades\Image as InterventionImage;
use JsonException;
use Throwable;

class ArgMediaLibraryController extends Controller
{
    private Filesystem $storage;
    private MediaLibConfig $config;

    public function __construct()
    {
        $this->storage = Storage::disk('public-folder');
        // $requestConfig = request('config');
        // $requestConfig = is_string($requestConfig)
        //     ? json_decode($requestConfig, true) :
        //     ($requestConfig ?? [
        //         'baseDir' => 'uploads',
        //         // 'baseSize' => [ 'name' => 'xl', 'nameSuffix' => '-xl', 'scale' => 100 ],
        //         'baseSize' => ['name' => 'Original', 'nameSuffix' => '', 'scale' => 100],
        //         'resizes' => [
        //             ['name' => 'Large', 'nameSuffix' => '-lg', 'scale' => 125],
        //             ['name' => 'Medium', 'nameSuffix' => '-md', 'scale' => 75],
        //             ['name' => 'Small', 'nameSuffix' => '-sm', 'scale' => 50],
        //         ],
        //         'extensions' => ['jpeg', 'jpg', 'png', 'webp', 'gif'],
        //     ]);
        // $requestConfig['extensions'] ??= ['jpeg', 'jpg', 'png', 'webp', 'gif'];

        $this->config = MediaLibConfig::createFromRequest('config');
        // $this->config['allSizeConfigs'] =
        //     array_merge([$this->config->baseSize], $this->config['resizes']);
    }

    public static function registerRoutes($middleware = ['auth:web']): void
    {
        Route::prefix('arg-media-library')->name('arg-media-library.')->middleware($middleware)->group(function () {
            Route::post('setup', [ArgMediaLibraryController::class, 'setup'])->name('setup');
            Route::post('select-files', [ArgMediaLibraryController::class, 'selectFiles'])->name('select-files');
            Route::post('delete-files', [ArgMediaLibraryController::class, 'deleteFiles'])->name('delete-files');
            Route::post('delete-folder', [ArgMediaLibraryController::class, 'deleteFolder'])->name('delete-folder');
            Route::post('create-folder', [ArgMediaLibraryController::class, 'createFolder'])->name('create-folder');
            Route::post('upload-files', [ArgMediaLibraryController::class, 'uploadFiles'])->name('upload-files');
            Route::post('rename-file', [ArgMediaLibraryController::class, 'renameFile'])->name('rename-file');
        });
    }

    public function createFolder(Request $request): bool
    {

        $request->validate([
            'name' => ['required', 'string'],
            'directory' => ['nullable', 'string']
        ]);

        $name = preg_replace('/\s+/', '-', $request->input('name'));
        $dir = $this->ensureBaseDir($request->input('directory'));
        $this->storage->makeDirectory($dir.'/'.$name);

        return true;
    }

    public function deleteFolder(Request $request): bool
    {

        $request->validate([
            'directory' => ['required', 'string']
        ]);

        $dir = $this->ensureBaseDir($request->input('directory'));

        $this->storage->deleteDirectory($dir);

        return true;
    }

    public function deleteFiles(Request $request): bool
    {

        $request->validate([
            'files' => ['required', 'array'],
            'directory' => ['required', 'string'],
        ]);

        $fileNames = $request->input('files');

        $dir = $this->ensureBaseDir($request->input('directory'));

        foreach ($fileNames as $fileNameNoSuffix) {
            $pathInfo = pathinfo($fileNameNoSuffix);
            $allSizeConfigs = $this->config->allSizeConfigs();
            foreach ($allSizeConfigs as $cfg) {
                $imgPath = $dir.'/'.$this->nameToTemplate($cfg, $pathInfo['filename'], $pathInfo['extension']);
                $this->storage->delete($imgPath);
            }
        }

        return true;
    }

    public function uploadFiles(Request $request): bool
    {
        // $settings = $request->input('settings');
        $files = $request->file('files') ?? $request->input('files');
        $files = array_map(function ($file) {
            $isPdf = $file instanceof UploadedFile;
            return new MediaLibFile(
                ext: $file->extension(),
                extClient: $file->getClientOriginalExtension(),
                dimensions: $isPdf ? null : $file->dimensions() ?? getimagesize($file),
                file: $isPdf ? $file : InterventionImage::read($file)
            );
        }, $files);

        return $this->_uploadFiles(
            $files,
            $request->input('directory'),
            $request->input('settings')
        );
    }

    private function _uploadFiles($files, $uploadDir, $settingsStr): bool
    {
        try {
            $settings = json_decode($settingsStr, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            abort(401, 'settings was not valid json!');
        }
        $uploadDir = $this->ensureBaseDir($uploadDir);

        /** @var MediaLibFile $file */
        foreach ($files as $index => $file) {
            $format = $settings[$index]['format'];
            $name = preg_replace('/\s+/', '-', $settings[$index]['name']);

            if (!in_array($file->ext, $this->config->extensions)) {
                continue;
            }

            $cfgBase = $this->config->baseSize;

            $append = '';
            $counter = 1;
            while ($this->storage->exists("$uploadDir/".$this->nameToTemplate($cfgBase, "$name$append", $format))) {
                $append = "-$counter";
                $counter++;
            }
            // $imageSize = $file->dimensions() ?? getimagesize($file);
            $imageSize = $file->dimensions;
            if (!$imageSize) { // if not image file (e.g. pdf)
                try {
                    if (!$file->file->storeAs("$uploadDir/".$this->nameToTemplate($cfgBase, "$name$append", $file->ext), [
                        "disk" => 'public-folder',
                    ])) {
                        abort(500, "Couldn't upload..");
                    }
                } catch (Throwable $e) {
                    abort(400, 'File not found! '.$e->getMessage());
                }
                continue;
            }

            // from here on, it's image file

            $originalImage = $file->file;//InterventionImage::read($file);
            [$w, $h] = $imageSize;
            if ($cfgBase->uploadConstraints->hasAny()) {
                [$w, $h] = $cfgBase->uploadConstraints->calcWidthHeight($imageSize);
                if ($w !== $imageSize[0] && $h !== $imageSize[1]) {
                    $originalImage = $originalImage->resize($w, $h);
                } else {
                    if ($w !== $imageSize[0] || $h !== $imageSize[1]) {
                        // if same, let the other decide aspect ratio
                        $w = $w === $imageSize[0] ? null : $w;
                        $h = $h === $imageSize[1] ? null : $h;
                        $originalImage = $originalImage->resize($w, $h);
                    }
                }
            }
            $encoder = $format == 'jpeg' || $format == 'jpg' ? new JpegEncoder() : ($format == 'png' ? new PngEncoder() : new AutoEncoder());
            $originalImage = $originalImage->encode($encoder);// , $cfgBase['scale']);

            $this->storage->put("$uploadDir/".$this->nameToTemplate($cfgBase, "$name$append", $format), $originalImage);

            foreach ($this->config->resizes as $cfg) {
                $newW = $w === null ? null : round($w * $cfg->scale / 100);
                $newH = $h === null ? null : round($h * $cfg->scale / 100);

                $imageOutput = $file->file //InterventionImage::read($file)
                ->resize($newW, $newH)     //, $w === null || $h === null ? static fn ($c)  => $c->aspectRatio() : null)
                ->encode($encoder);
                $this->storage->put("$uploadDir/".$this->nameToTemplate($cfg, "$name$append", $format), $imageOutput);
            }
        }
        return true;
    }

    private function getFiles(string $directory): array
    {
        $files = $this->storage->files($directory);
        return array_filter($files, fn($file) => in_array(pathinfo($file, PATHINFO_EXTENSION), $this->config->extensions));
    }

    public function setup(Request $request): array
    {
        // return $this->storage->allDirectories('/');
        $request->validate([
            'directory' => ['nullable', 'string']
        ]);

        $fileOnlyMode = $request->get('filesOnly', false);

        // $directories = $fileOnlyMode ? [] : $this->storage->allDirectories($this->config->baseDir);
        // if (!$fileOnlyMode) {
        //     $directories = array_merge([$this->config->baseDir], $directories);
        // }
        $directories = array_merge([$this->config->baseDir], $this->storage->allDirectories($this->config->baseDir));
        // return $directories;
        $directories_array = [];

        foreach ($directories as $index => $directory) {
            // $directory2 = trim(Str::replace(self::baseDir , '' , $directory), '/') ?: '/';

            $info = [
                'directory' => $directory,
                'pathinfo' => pathinfo($directory),
                'parent_id' => null,
                'inner' => [],
                'indent' => 0,
                'fileCount' => 0
            ];

            $key = array_search($info['pathinfo']['dirname'], array_column($directories_array, 'directory'), true);

            if (is_numeric($key)) {
                $directories_array[$key]['inner'][] = $info['directory'];
                $info['parent'] = $directories_array[$key]['directory'];
                $info['indent'] = $directories_array[$key]['indent'] + 1;
                $info['fileCount'] = count($this->getFiles($directory));
            }

            $directories_array[] = $info;
        }

        $directory = $this->ensureBaseDir($request->input('directory'));
        $files = collect($this->getFiles($directory))->map(fn($f) => [$f, pathinfo($f)]);
        // dd($directory, $files);
        $files_array = collect();
        $filesToSkip = [];

        /* @var $iValue array<string, array> */
        foreach ($files as $iValue) {
            [$single_file, $pathInfo] = $iValue;

            if (in_array($pathInfo['basename'], $filesToSkip)) {
                continue;
            }

            $ext = $pathInfo['extension'];

            if (!in_array($ext, $this->config->extensions)) {
                continue;
            }

            //check if the name of file matches the template of base size config
            if (!str_contains($pathInfo['basename'], $this->config->baseSize->nameSuffix.'.'.$ext)) {
                continue;
            }
            $nameWithoutSuffix = str_replace($this->config->baseSize->nameSuffix.'.'.$ext, '', $pathInfo['basename']);

            $file_info = [];
            $file_info['name'] = $nameWithoutSuffix.'.'.$ext;

            if ($files_array->contains('name', '=', $file_info['name'])) {
                continue;
            }

            $file_info['url'] = [
                $this->config->baseSize->name => self::removeDomain(url($single_file)),
            ];
            foreach ($this->config->resizes as $cfg) {
                $imgPath = $this->nameToTemplate($cfg, $nameWithoutSuffix, $ext);
                $existing = $files->filter(fn($f) => $f[1]['basename'] === $imgPath);
                if (count($existing) === 0) {
                    continue;
                }
                $filesToSkip[] = $imgPath;
                $file_info['url'][$cfg->name] = self::removeDomain(url($imgPath));
            }

            $file_info['time'] = $this->storage->lastModified($single_file);
            $file_info['size'] = $this->storage->size($single_file);
            $file_info['path'] = $single_file;

            $files_array->push($file_info);
        }

        $toReturn = [
            'base_dir' => $directories_array[0]['directory'],
            'active_dir' => $directory,
            'files' => $files_array
        ];

        // if (!$fileOnlyMode) {
            $toReturn['directories'] = $directories_array;
        // }

        return $toReturn;
    }

    public function selectFiles(Request $request): array
    {
        $request->validate([
            'directory' => ['required', 'string'],
            'files' => ['required', 'array'] // files names without 'nameSuffix'
        ]);

        $files = [];

        $debug = collect();
        foreach ($request->get('files') as $fileNameNoSuffix) {
            $pathInfo = pathinfo($fileNameNoSuffix);
            $pathNoExt = $request->get('directory').'/'.$pathInfo['filename'];
            $ext = $pathInfo['extension'];

            $result = [
                'fileNameNoSuffix' => $fileNameNoSuffix,
                'selected' => $this->config->baseSize->name,

                'select' => [
                    'url' => self::removeDomain(url($this->nameToTemplate($this->config->baseSize, $pathNoExt, $ext))),
                    'alt' => ''
                ],
                'values' => [],
            ];

            $allSizeConfigs = $this->config->allSizeConfigs();
            foreach ($allSizeConfigs as $cfg) {
                $imgPath = $this->nameToTemplate($cfg, $pathNoExt, $ext);
                if (!file_exists($imgPath)) {
                    $debug[] = $imgPath;
                    continue;
                    // abort(404,  "$imgPath does not exist!");
                }
                $imgSize = getimagesize($this->storage->path($imgPath)) ?: [0, 0];

                $result['values'][$cfg->name] = [
                    'path' => $imgPath,
                    'url' => self::removeDomain(url($imgPath)),
                    'size' => $this->fileSizeFormat($imgPath),
                    'height' => $imgSize[1],
                    'width' => $imgSize[0],
                ];
            }

            $valuesCount = count(array_keys($result['values']));
            if ($valuesCount === 0) {
                return ['error' => $debug];
            }else if ($valuesCount > 1) {
                // sort by size
                Arr::sort($result['values'],
                    fn($a, $b) => $a['width'] <=> $b['width']
                );
            }

            $baseVal = $result['values'][$this->config->baseSize->name];
            $result['aspectRatio'] = $baseVal['height'] ? $baseVal['width'] / $baseVal['height'] : 0;
            $files[] = $result;
        }

        return ['files' => $files];
    }

    public function renameFile(Request $request)
    {
        $data = $request->validate([
            'old' => ['required', 'string'],
            'new' => ['required', 'string', 'different:old'],
        ]);

        $oldDir = $this->ensureBaseDir($data['old']);
        $newDir = $this->ensureBaseDir($data['new']);

        // $this->storage->config['throw'] = true;
        if (!$this->storage->move($oldDir, $newDir)) {
            abort(500, 'Could not rename file!');
        }

        return $newDir;
    }

    private function ensureBaseDir($dir): string
    {
        if (str_starts_with($dir, $this->config->baseDir)) {
            return $dir;
        }

        return $this->config->baseDir.'/'.Str::ltrim($dir, '/');
    }

    private function nameToTemplate(MediaLibConfigSize $sizeConf, $name, $ext): string
    {
        return $name.$sizeConf->nameSuffix.'.'.$ext;
    }

    private function fileSizeFormat($filePath): string
    {
        $size = $this->storage->size($filePath);
        $units = array('B', 'KB', 'MB');

        $power = $size > 0 ? floor(log($size, 1024)) : 0;

        return number_format($size / (1024 ** $power), 2).' '.$units[$power];
    }

    private static function removeDomain($url, $removeFirstSlash = false)
    {
        $url = parse_url($url, PHP_URL_PATH);
        return $removeFirstSlash ? trim($url, '/') : $url;
    }
}
