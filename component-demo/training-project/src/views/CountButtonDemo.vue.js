import { ref } from 'vue';
import CountButton from '../components/CountButton/CountButton.vue';
const latestValue = ref(0);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "demo-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "demo-card__hint" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "demo-row" },
});
/** @type {[typeof CountButton, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(CountButton, new CountButton({
    ...{ 'onChange': {} },
}));
const __VLS_1 = __VLS_0({
    ...{ 'onChange': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onChange: (...[$event]) => {
        __VLS_ctx.latestValue = $event;
    }
};
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.latestValue);
/** @type {__VLS_StyleScopedClasses['demo-card']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-card__hint']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CountButton: CountButton,
            latestValue: latestValue,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
