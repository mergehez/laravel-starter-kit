// noinspection SpellCheckingInspection

import * as fs from "node:fs";
import {readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {gzipSync} from "node:zlib";
import esbuild from "esbuild";

const dist = 'public/build/assets';
const jsFiles = fs.readdirSync(dist)
    .filter((file) => file.endsWith(".js") || file.endsWith(".css") || file.endsWith(".html"))
    .map((file) => `${dist}/${file}`)

jsFiles.sort((a, b) => {
    if (a.endsWith('.css')) return -1;
    if (b.endsWith('.css')) return 1;
    return fs.statSync(a).size - fs.statSync(b).size;
})

let maxLen = 0;
for (const path of jsFiles) {
    if (path.length > maxLen) {
        maxLen = path.length;
    }
}

const silent = process.argv.includes('--silent');

function clog(...args: any[]) {
    if (!silent)
        console.log(...args);
}

function cerror(...args: any[]) {
    if (!silent)
        console.error(...args);
}

export const compressor = () => {
    return {
        name: 'compressor-plugin',
        setup(build: any) {
            build.initialOptions.metafile = true;
            build.onEnd((res: any) => {
                for (const filePath in res.metafile.outputs) {
                    const fileType = filePath.substring(filePath.lastIndexOf('.') + 1);
                    if (['js', 'css', 'html'].includes(fileType)) {
                        const content = readFileSync(filePath, {encoding: 'utf8'});
                        const compressedContent = gzipSync(content);
                        const compressedFileName = `${filePath.split('/').at(-1)}.gz`;
                        const compressedFilePath = path.join(build.initialOptions.outdir || dist, compressedFileName);

                        writeFileSync(compressedFilePath, compressedContent);
                    }
                }
            });
        },
    };
};

function byteToSize(bytes: number) {
    let str = ``;
    const kb = bytes / 1024;
    if (kb < 1024)
        str = `${kb.toFixed(2)} KB`;
    else
        str = `${(kb / 1024).toFixed(2)} MB`;

    return str;
    // return {str, bytes};
}

function createObj(paths: string[]) {
    function createLine(path: string, size?: number) {
        return {
            path,
            init: byteToSize(size ?? fs.statSync(path).size),
            min: {str: '', bytes: 0},
            gzip: {str: '', bytes: 0},
            toString(maxes) {
                return `| ${this.path.padEnd(maxes.init)} : ${this.init.str.padStart(maxes.init + 1)} ->  ${this.min.str.padStart(maxes.min + 1)} ->  ${this.gzip.str.padStart(maxes.gzip + 1)}  |`;
            }
        };
    }

    // const getMaxLen = (arr) => arr.reduce((a, b) => a.length > b.length ? a : b, '').length;
    const _lines = paths.map(path => createLine(path));
    return {
        lines: _lines,
        exts: Array.from(new Set(_lines.map(t => t.path.split('/').at(-1).split('.').slice(1).join('.')))),
        getTotals() {
            return this.exts.map(ext => {
                const total = this.items.filter(t => t.path.endsWith(ext))
                    .reduce((a, b) => {
                        a.init.bytes += b.init.bytes;
                        a.min.bytes += b.min.bytes;
                        a.gzip.bytes += b.gzip.bytes;
                        return a;
                    }, createLine('Total ' + ext, 0));
                return total;
            })
        },
        getMaxLengths() {
            return this.items.reduce((a, b) => {
                a.init = a.init > b.init.str.length ? a.init : b.init.str.length;
                a.min = a.min > b.min.str.length ? a.min : b.min.str.length;
                a.gzip = a.gzip > b.gzip.str.length ? a.gzip : b.gzip.str.length;
                return a;
            }, {init: 0, min: 0, gzip: 0});
        },
        update(path, min = undefined, gzip = undefined) {
            const item = this.items.find(t => t.path === path);
            item.min = byteToSize(min ?? fs.statSync(path).size);
            item.gzip = byteToSize(gzip ?? fs.statSync(path + '.gz').size);
        }
    };
}

// const results = Object.fromEntries(jsFiles.map((path) => [path, {size:[fs.statSync(path).size, byteToSize(fs.statSync(path).size)], sizeMin: 0, sizeGzip: 0}]));
// const results = createObj(jsFiles);
const info = jsFiles.map((path) => ({
    path,
    init: {str: byteToSize(fs.statSync(path).size), bytes: fs.statSync(path).size},
    min: {str: '', bytes: 0},
    gzip: {str: '', bytes: 0},
}));
const totals = Array.from(new Set(info.map(t => t.path.split('.').at(-1)))).map(ext => {
    const items = info.filter(t => t.path.endsWith(ext));
    const initTotal = items.reduce((a, b) => a + b.init.bytes, 0);
    return ({
        path: "Total " + ext,
        init: {str: byteToSize(initTotal), bytes: initTotal},
        min: {str: '', bytes: 0},
        gzip: {str: '', bytes: 0},
    });
})

function minify(path, index) {
    const esPath = 'esbuild' + path;
    esbuild.build({
        entryPoints: [path],
        minify: true,
        outfile: esPath,
        allowOverwrite: true,
        drop: ['console', 'debugger'],
        target: ['es2020'],
        treeShaking: true,
        plugins: [compressor()]
    }).then(() => {
        // results.update(path);
        const item = info.find(t => t.path === path);
        item.min = {str: byteToSize(fs.statSync(esPath).size), bytes: fs.statSync(esPath).size};
        if (item.min.bytes > item.init.bytes) {
            fs.unlinkSync(esPath);
            item.min = item.init;
        } else {
            fs.renameSync(esPath, path);
        }

        item.gzip = {str: byteToSize(fs.statSync(path + '.gz').size), bytes: fs.statSync(path + '.gz').size};
        const titem = totals.find(t => path.endsWith(t.path.replace('Total ', '')));
        titem.min.bytes += item.min.bytes;
        titem.min.str = byteToSize(titem.min.bytes);
        titem.gzip.bytes += item.gzip.bytes;
        titem.gzip.str = byteToSize(titem.gzip.bytes);

        if (index + 1 < jsFiles.length) {
            minify(jsFiles[index + 1], index + 1);
        } else {
            const replaceDist = (str: string) => str.replace(dist + '/', '\u001b[1;90m' + dist + '/\x1b[0m');
            const mPath = info.reduce((a, b) => a.length > replaceDist(b.path).length ? a : replaceDist(b.path), '').length;
            const mInit = info.reduce((a, b) => a.length > b.init.str.length ? a : b.init.str, '').length;
            const mMin = info.reduce((a, b) => a.length > b.min.str.length ? a : b.min.str, '').length;
            const mGzip = info.reduce((a, b) => a.length > b.gzip.str.length ? a : b.gzip.str, '').length;

            // const I = '\u001b[1;90m|\x1b[0m';
            const I = '\u001b[1;90m│\x1b[0m';
            const lineToString = (l: any) => {
                const diffPercentage = l.init.bytes == 0 ? 0 : (-1 * (((l.init.bytes - l.min.bytes) / l.init.bytes) * 100));
                return `${I} ${replaceDist(l.path.padEnd(mPath - 8))} ` +
                    `${I} \u001b[1;90m${l.init.str.padStart(mInit + 1)}\x1b[0m ` +
                    `${I}  \u001b[1;32m${l.min.str.padStart(mMin + 1)}\x1b[0m ` +
                    (diffPercentage < 0
                            ? `${I}  \u001b[1;32m${diffPercentage.toFixed(2).padStart(5)}%\x1b[0m `
                            : diffPercentage == 0
                                ? `${I}  \u001b[1;31m${''.padStart(6)}\x1b[0m `
                                : `${I}  \u001b[1;31m${diffPercentage.toFixed(2).padStart(5)}%\x1b[0m `
                    ) +
                    `${I}  \u001b[1;90m${l.gzip.str.padStart(mGzip + 1)}\x1b[0m   ` +
                    `${I}`;
            };

            const dashLen = mPath + mInit + mMin + mGzip + 5 + 5 + 10;
            clog('\u001b[1;90m┏\x1b[0m' + '\u001b[1;90m─\x1b[0m'.repeat(dashLen) + '\u001b[1;90m┐\x1b[0m');
            info.forEach(t => clog(lineToString(t)));
            clog(I + '\u001b[1;90m┈\x1b[0m'.repeat(dashLen) + I);
            totals.forEach(t => clog(lineToString(t)));
            clog('\u001b[1;90m┗\x1b[0m' + '\u001b[1;90m─\x1b[0m'.repeat(dashLen) + '\u001b[1;90m┛\x1b[0m');
        }
    }).catch((e) => {
        cerror(`Failed to minify ${path}`);
        cerror(e);
    })
}

minify(jsFiles[0], 0)
