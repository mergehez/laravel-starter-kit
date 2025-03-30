<script
    setup
    lang="ts"
    generic="TEditor extends { create( ...args: any[] ): Promise<Editor> }"
>
import { debounce } from 'lodash-es';
import {
    ref,
    watch,
    markRaw,
    onMounted,
    onBeforeUnmount
} from 'vue';
import type { Editor, EditorConfig, EventInfo } from 'ckeditor5';
import { version as vueVersion } from 'vue';
import { createIntegrationUsageDataPlugin } from '@ckeditor/ckeditor5-integrations-common';
import { appendExtraPluginsToEditorConfig, isCKEditorFreeLicense } from '@ckeditor/ckeditor5-integrations-common';

type EditorType = TEditor extends { create( ...args: Array<any> ): Promise<infer E> }
    ? E
    : never

defineOptions( {
    name: 'CKEditor'
} );

const model = defineModel( 'modelValue', { type: String, default: '' } );

const props = withDefaults( defineProps<{
    editor: TEditor;
    config?: EditorConfig;
    disabled?: boolean;
    disableTwoWayDataBinding?: boolean;
}>(), {
    config: () => ( {} ),
    disabled: false,
    disableTwoWayDataBinding: false
} );

const emit = defineEmits<{
    ready: [ editor: EditorType ],
    destroy: [],
    blur: [ event: EventInfo, editor: EditorType ],
    focus: [ event: EventInfo, editor: EditorType ],
    input: [ data: string, event: EventInfo, editor: EditorType ],
    'update:modelValue': [ data: string, event: EventInfo, editor: EditorType ],
}>();

const VUE_INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from Vue integration (@ckeditor/ckeditor5-vue)';
const INPUT_EVENT_DEBOUNCE_WAIT = 300;

const element = ref<HTMLElement>();
const instance = ref<EditorType>();
const lastEditorData = ref<string>();

defineExpose( {
    instance,
    lastEditorData
} );

watch( model, newModel => {
    // Synchronize changes of #modelValue. There are two sources of changes:
    //
    //                External modelValue change      ──────╮
    //                                                      ╰─────> ┏━━━━━━━━━━━┓
    //                                                              ┃ Component ┃
    //                                                      ╭─────> ┗━━━━━━━━━━━┛
    //                   Internal data change         ──────╯
    //             (typing, commands, collaboration)
    //
    // Case 1: If the change was external (via props), the editor data must be synced with
    // the component using instance#setData() and it is OK to destroy the selection.
    //
    // Case 2: If the change is the result of internal data change, the #modelValue is the
    // same as this.lastEditorData, which has been cached on #change:data. If we called
    // instance#setData() at this point, that would demolish the selection.
    //
    // To limit the number of instance#setData() which is time-consuming when there is a
    // lot of data we make sure:
    //    * the new modelValue is at least different than the old modelValue (Case 1.)
    //    * the new modelValue is different than the last internal instance state (Case 2.)
    //
    // See: https://github.com/ckeditor/ckeditor5-vue/issues/42.
    if ( instance.value && newModel !== lastEditorData.value ) {
        instance.value.data.set( newModel );
    }
} );

watch( () => props.disabled, readOnlyMode => {
    if ( readOnlyMode ) {
        instance.value!.enableReadOnlyMode( VUE_INTEGRATION_READ_ONLY_LOCK_ID );
    } else {
        instance.value!.disableReadOnlyMode( VUE_INTEGRATION_READ_ONLY_LOCK_ID );
    }
} );

function checkVersion(): void {
    const version = window.CKEDITOR_VERSION;

    if ( !version ) {
        return console.warn( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
    }

    const [ major ] = version.split( '.' ).map( Number );

    if ( major >= 42 || version.startsWith( '0.0.0' ) ) {
        return;
    }

    console.warn( 'The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.' );
}

function setUpEditorEvents( editor: EditorType ) {
    const emitDebouncedInputEvent = debounce( ( evt: EventInfo ) => {
        if ( props.disableTwoWayDataBinding ) {
            return;
        }

        const data = lastEditorData.value = editor.data.get();

        // The compatibility with the v-model and general Vue.js concept of input–like components.
        emit( 'update:modelValue', data, evt, editor );
        emit( 'input', data, evt, editor );
    }, INPUT_EVENT_DEBOUNCE_WAIT, { leading: true } );

    editor.model.document.on( 'change:data', emitDebouncedInputEvent );

    editor.editing.view.document.on( 'focus', ( evt: EventInfo ) => {
        emit( 'focus', evt, editor );
    } );

    editor.editing.view.document.on( 'blur', ( evt: EventInfo ) => {
        emit( 'blur', evt, editor );
    } );
}

checkVersion();

onMounted( () => {
    function appendAllIntegrationPluginsToConfig( editorConfig: EditorConfig ): EditorConfig {
        if(!editorConfig.licenseKey)
            editorConfig.licenseKey = 'GPL';
        if ( isCKEditorFreeLicense( editorConfig.licenseKey ) ) {
            return editorConfig;
        }

        console.log('not free license');
        return appendExtraPluginsToEditorConfig( editorConfig, [
            createIntegrationUsageDataPlugin(
                'vue',
                {
                    version: '7.3.0',
                    frameworkVersion: vueVersion
                }
            )
        ] );
    }
    const editorConfig: EditorConfig = appendAllIntegrationPluginsToConfig(
        Object.assign( {}, props.config )
    );

    if ( model.value ) {
        editorConfig.initialData = model.value;
    }

    ( props.editor.create( element.value, editorConfig ) as unknown as Promise<EditorType> )
        .then( editor => {
            instance.value = markRaw( editor );

            setUpEditorEvents( editor );

            if ( model.value !== editorConfig.initialData ) {
                editor.data.set( model.value );
            }

            if ( props.disabled ) {
                editor.enableReadOnlyMode( VUE_INTEGRATION_READ_ONLY_LOCK_ID );
            }

            emit( 'ready', editor );
        } )
        .catch( error => {
            console.error( error );
        } );
} );

onBeforeUnmount( () => {
    if ( instance.value ) {
        instance.value.destroy();
        instance.value = undefined;
    }

    // Note: By the time the editor is destroyed (promise resolved, editor#destroy fired)
    // the Vue component will not be able to emit any longer. So emitting #destroy a bit earlier.
    emit( 'destroy' );
} );
</script>

<template>
    <div ref="element"></div>
</template>