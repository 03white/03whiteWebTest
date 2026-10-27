const props = withDefaults(defineProps(), {
    disabled: false,
});
const emit = defineEmits();
function toggle() {
    if (props.disabled)
        return;
    const value = !props.modelValue;
    emit('update:modelValue', value);
    emit('change', value);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    disabled: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['base-switch']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggle) },
    ...{ class: "base-switch" },
    ...{ class: ({ 'base-switch--on': __VLS_ctx.modelValue, 'is-disabled': __VLS_ctx.disabled }) },
    type: "button",
    disabled: (__VLS_ctx.disabled),
    'aria-checked': (__VLS_ctx.modelValue),
    role: "switch",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
    ...{ class: "base-switch__thumb" },
});
/** @type {__VLS_StyleScopedClasses['base-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['base-switch__thumb']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            toggle: toggle,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
