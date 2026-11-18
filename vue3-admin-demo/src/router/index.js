import {createRouter,createWebHistory} from 'vue-router'
import pinia from '../store'
import {useUserStore} from '../store/user'
const routes=[
    {
        path:'/login',
        name:'Login',
        component:()=>import('../views/Login.vue'),
    },
    {
        path:'/',
        component:()=>import('../layout/Layout.vue'),
        redirect:'/home',
        children:[
            {
                path:'home',
                name:'Home',
                component:()=>import('../views/Home.vue'),
                meta:{
                    title:'首页',
                    icon:'HomeFilled',
                    roles:['admin','user']
                }
            },
            {
                path:'system/user',
                name:'UserManage',
                component:()=>import('../views/system/UserManage.vue'),
                meta:{
                    title:'用户管理',
                    icon:'User',
                    roles:['admin']
                }
            },
            {
                path:'system/role',
                name:'RoleManage',
                component:()=>import('../views/system/RoleManage.vue'),
                meta:{
                    title:'角色管理',
                    icon:'UserFilled',
                    roles:['admin']
                    }
            },
            {
                path:'test/test1',
                name:'Test1',
                component:()=>import("../views/test/Test1.vue"),
                meta:{
                    title:'测试1',
                    icon:'Document',
                    roles:['admin','user']
                }
            },
            {
                path:'test/test2',
                name:'Test2',
                component:()=>import("../views/test/Test2.vue"),
                meta:{
                    title:'测试2',
                    icon:'Document',
                    roles:['admin','user']
                }
            },
            {
                path:'about',
                name:'About',
                component:()=>import("../views/About.vue"), 
                meta:{
                    title:'关于',
                    icon:'InfoFilled',
                    roles:['admin','user']
                }
            }
        ]
    },   
    {
        path:'/:pathMatch(.*)*',
        name:'NotFound',
        component:()=>import('../views/NotFound.vue'),
    }
]
const router=createRouter({
    history:createWebHistory(),
    routes
})
router.beforeEach((to,from,next)=>{
    document.title=to.meta.title?`${to.meta.title}-vue3-admin`:'vue3-admin'
    const userStore=useUserStore(pinia)
    if(to.path==='/login'){
        if(userStore.isLogin) return next('/home')
        return next()
    }
    if(!userStore.isLogin){
        return next(`/login?redirect=${to.fullPath}`)
    }
    const roles=to.meta.roles
    if(roles&&!roles.includes(userStore.role)){
        return next('/home')
    }
    next()
})
export default router