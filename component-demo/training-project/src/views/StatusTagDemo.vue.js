import StatusTag from '../components/StatusTag/StatusTag.vue';
function handleClick() {
    window.alert('StatusTag 被点击了');
}
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
/** @type {[typeof StatusTag, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(StatusTag, new StatusTag({
    ...{ 'onClick': {} },
    text: "已完成",
    type: "success",
}));
const __VLS_1 = __VLS_0({
    ...{ 'onClick': {} },
    text: "已完成",
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onClick: (__VLS_ctx.handleClick)
};
var __VLS_2;
/** @type {[typeof StatusTag, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(StatusTag, new StatusTag({
    text: "处理中",
    type: "warning",
    plain: true,
}));
const __VLS_8 = __VLS_7({
    text: "处理中",
    type: "warning",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
/** @type {[typeof StatusTag, typeof StatusTag, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(StatusTag, new StatusTag({
    type: "error",
    disabled: true,
}));
const __VLS_11 = __VLS_10({
    type: "error",
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
var __VLS_12;
/** @type {__VLS_StyleScopedClasses['demo-card']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-card__hint']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            StatusTag: StatusTag,
            handleClick: handleClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
