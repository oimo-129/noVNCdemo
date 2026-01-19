    <!-- src/views/LoginView.vue -->
    <template>
        <div>
          <h1>登录页</h1>
          <button @click="login">模拟登录</button>
        </div>
      </template>
      <script setup>
      import { useRouter } from 'vue-router';
      const router = useRouter();
      function login() {
        // 1. 存一个假token，表示已登录
        localStorage.setItem('token', 'user-is-logged-in');
        // 2. 跳转到仪表盘
        router.push('/dashboard');
      }
      </script>