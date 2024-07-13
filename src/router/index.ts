import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('@/views/VerifyView.vue'),
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
    },
    {
      path: '/question',
      name: 'question',
      component: () => import('@/views/QuestionView.vue'),
    },
    {
      path: '/article',
      name: 'article',
      component: () => import('@/views/ArticleView.vue'),
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/UserView.vue'),
    },
  ],
});

export default router;
