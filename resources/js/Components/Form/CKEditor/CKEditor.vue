<script setup lang="ts">
import {ref} from 'vue';
import '../../../../css/ckeditor.scss';
import {EditorConfig} from "@ckeditor/ckeditor5-core/src/editor/editorconfig";
import CkEditorVueConverter from './CkEditorVueConverter.vue'
import {ClassicEditor, Editor} from 'ckeditor5';
import * as CkPlugins from 'ckeditor5';
import translationsDe from 'ckeditor5/translations/de.js';
import translationsEn from 'ckeditor5/translations/en.js';
import translationsTr from 'ckeditor5/translations/tr.js';
import globalState from "@/utils/globalState";
import {__} from "@/utils/localization";
import {uniqueId} from "@/utils/utils";
import {usePage} from "@/utils/inertia";

const modelValue = defineModel<string>();
defineProps<{
    placeholder?: string
}>()

const editorConfig = ref<EditorConfig>({
    toolbar: {
        items: [
            'undo',
            'redo',
            '|',
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            '|',
            'horizontalLine',
            'link',
            'insertImage',
            'mediaEmbed',
            'insertTable',
            'highlight',
            'blockQuote',
            '|',
            'alignment',
            'bulletedList',
            'numberedList',
            'todoList',
            'outdent',
            'indent',
            '|',
            'accessibilityHelp',
        ],
        shouldNotGroupWhenFull: false
    },
    plugins: [
        CkPlugins.AccessibilityHelp,
        CkPlugins.Alignment,
        CkPlugins.Autoformat,
        CkPlugins.AutoImage,
        CkPlugins.AutoLink,
        CkPlugins.Autosave,
        CkPlugins.BalloonToolbar,
        CkPlugins.BlockQuote,
        CkPlugins.Bold,
        CkPlugins.Essentials,
        CkPlugins.Heading,
        CkPlugins.Highlight,
        CkPlugins.HorizontalLine,
        CkPlugins.ImageBlock,
        CkPlugins.ImageCaption,
        CkPlugins.ImageInline,
        CkPlugins.ImageInsert,
        CkPlugins.ImageInsertViaUrl,
        CkPlugins.ImageResize,
        CkPlugins.ImageStyle,
        CkPlugins.ImageTextAlternative,
        CkPlugins.ImageToolbar,
        CkPlugins.ImageUpload,
        CkPlugins.Indent,
        CkPlugins.IndentBlock,
        CkPlugins.Italic,
        CkPlugins.Link,
        CkPlugins.LinkImage,
        CkPlugins.List,
        CkPlugins.ListProperties,
        CkPlugins.MediaEmbed,
        CkPlugins.Paragraph,
        CkPlugins.PasteFromOffice,
        CkPlugins.Strikethrough,
        CkPlugins.Table,
        CkPlugins.TableCaption,
        CkPlugins.TableCellProperties,
        CkPlugins.TableColumnResize,
        CkPlugins.TableProperties,
        CkPlugins.TableToolbar,
        CkPlugins.TextTransformation,
        CkPlugins.TodoList,
        CkPlugins.Underline,
        CkPlugins.Undo
    ],
    balloonToolbar: ['bold', 'italic', 'underline', 'strikethrough', '|', 'link'],
    heading: {
        options: [
            {
                model: 'paragraph',
                title: 'Paragraph',
                class: 'ck-heading_paragraph'
            },
            {
                model: 'heading1',
                view: 'h1',
                title: 'Heading 1',
                class: 'ck-heading_heading1'
            },
            {
                model: 'heading2',
                view: 'h2',
                title: 'Heading 2',
                class: 'ck-heading_heading2'
            },
            {
                model: 'heading3',
                view: 'h3',
                title: 'Heading 3',
                class: 'ck-heading_heading3'
            },
            {
                model: 'heading4',
                view: 'h4',
                title: 'Heading 4',
                class: 'ck-heading_heading4'
            },
            {
                model: 'heading5',
                view: 'h5',
                title: 'Heading 5',
                class: 'ck-heading_heading5'
            },
            {
                model: 'heading6',
                view: 'h6',
                title: 'Heading 6',
                class: 'ck-heading_heading6'
            }
        ]
    },
    image: {
        toolbar: [
            'toggleImageCaption',
            'imageStyle:side',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|', 'resizeImage',
            'imageTextAlternative'
        ],
        resizeOptions: [
            {name: 'resizeImage:original', label: 'Original', value: null},
            {name: 'resizeImage:10', label: '10%', value: '10'},
            {name: 'resizeImage:20', label: '20%', value: '20'},
            {name: 'resizeImage:25', label: '25%', value: '25'},
            {name: 'resizeImage:30', label: '30%', value: '30'},
            {name: 'resizeImage:40', label: '40%', value: '40'},
            {name: 'resizeImage:50', label: '50%', value: '50'},
            {name: 'resizeImage:60', label: '60%', value: '60'},
            {name: 'resizeImage:75', label: '75%', value: '75'},
            {name: 'resizeImage:80', label: '80%', value: '80'},
            {name: 'resizeImage:90', label: '90%', value: '90'},
            {name: 'resizeImage:95', label: '95%', value: '95'},
            {name: 'resizeImage:100', label: '100%', value: '100'}
        ],
    },
    initialData: '',
    language: usePage().props.localization.locale,
    link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
            toggleDownloadable: {
                mode: 'manual',
                label: 'Downloadable',
                attributes: {
                    download: 'file'
                }
            }
        }
    },
    list: {
        properties: {
            styles: true,
            startIndex: true,
            reversed: true
        }
    },
    placeholder: __('type_content_here'),
    table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
    },
    translations: [
        translationsEn,
        translationsDe,
        translationsTr,
    ]
});

let ckEditor: Editor;

const editorId = 'ck-'+uniqueId();
function onEditorReady(editor: Editor) : any {
    ckEditor = editor;
    const btn = document.querySelector(`#${editorId} .ck-file-dialog-button`) as HTMLButtonElement;
    if (!btn) return
    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation()

        console.log('open media library');
        globalState.mediaLibrary.open((t) => {
            console.log('selected', t, ckEditor);
            // ckEditor.commands.get('insertImage')!.execute({
            //     source: t.url,
            //     // link: t.url,
            // });
            ckEditor.execute('insertImage', {
                source: {
                    src: t.url,
                    alt: t.url,
                    width: '100%',
                },
            });
        });
    }
}

</script>

<template>
    <div :id="editorId" class="arg-ck-editor">
        <CkEditorVueConverter
            required
            :placeholder="placeholder"
            class="!h-full"
            :editor="ClassicEditor as any"
            v-model="modelValue"
            @ready="onEditorReady as any"
            :config="editorConfig as any"
        />
    </div>
</template>