const __VLS_props = withDefaults(defineProps(), {
    text: '',
    type: 'success',
    plain: false,
    disabled: false,
});
const emit = defineEmits();
function handleClick(event) {
    emit('click', event);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    text: '',
    type: 'success',
    plain: false,
    disabled: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['status-tag--plain']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag--success']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag--plain']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag--warning']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag--plain']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag--error']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.handleClick) },
    ...{ class: "status-tag" },
    ...{ class: ([`status-tag--${__VLS_ctx.type}`, { 'status-tag--plain': __VLS_ctx.plain, 'is-disabled': __VLS_ctx.disabled }]) },
    disabled: (__VLS_ctx.disabled),
    type: "button",
});
var __VLS_0 = {};
(__VLS_ctx.text);
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            handleClick: handleClick,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
