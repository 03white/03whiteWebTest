import StatusDot from '../components/StatusDot/StatusDot.vue';
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
/** @type {[typeof StatusDot, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(StatusDot, new StatusDot({
    status: "success",
}));
const __VLS_1 = __VLS_0({
    status: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {[typeof StatusDot, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(StatusDot, new StatusDot({
    status: "warning",
}));
const __VLS_4 = __VLS_3({
    status: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
/** @type {[typeof StatusDot, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(StatusDot, new StatusDot({
    status: "error",
}));
const __VLS_7 = __VLS_6({
    status: "error",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['demo-card']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-card__hint']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            StatusDot: StatusDot,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
