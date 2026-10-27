import AppButton from '../components/AppButton/AppButton.vue';
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
/** @type {[typeof AppButton, typeof AppButton, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppButton, new AppButton({
    variant: "primary",
}));
const __VLS_1 = __VLS_0({
    variant: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
var __VLS_2;
/** @type {[typeof AppButton, typeof AppButton, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(AppButton, new AppButton({
    variant: "secondary",
}));
const __VLS_4 = __VLS_3({
    variant: "secondary",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_5.slots.default;
var __VLS_5;
/** @type {[typeof AppButton, typeof AppButton, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(AppButton, new AppButton({
    variant: "danger",
}));
const __VLS_7 = __VLS_6({
    variant: "danger",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
var __VLS_8;
/** @type {__VLS_StyleScopedClasses['demo-card']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-card__hint']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppButton: AppButton,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
