
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
//路由表
const routes = [
  //路由记录
  {
    path: '/',
    name: 'home',//路由唯一名称
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //懒加载的指令执行
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    meta: { requiresAuth: true } // 给保安一个标记：这个页面需要认证
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  }
]
//创建并导出router实例
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})


// 全局前置守卫 (保安)
router.beforeEach((to, from, next) => {
  // 检查目标页面是否需要登录 (检查通行标记)
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录 (检查口袋里有没有token)
    const token = localStorage.getItem('token');
    if (token) {
      // 有token，放行！
      next();
    } else {
      // 没有token，滚去登录！
      next('/login');
    }
  } else {
    // 目标页面不需要登录，直接放行！
    next();
  }
});


export default router
