import { ref } from 'vue';
const props = withDefaults(defineProps(), {
    disabled: false,
});
const emit = defineEmits();
const count = ref(0);
function increment() {
    if (props.disabled)
        return;
    count.value += 1;
    emit('change', count.value);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    disabled: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.increment) },
    type: "button",
    disabled: (__VLS_ctx.disabled),
});
(__VLS_ctx.count);
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            count: count,
            increment: increment,
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
