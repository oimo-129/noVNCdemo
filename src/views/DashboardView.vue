    <!-- src/views/DashboardView.vue -->
    <template>
        <div>
          <h1>仪表盘</h1>
          <p>欢迎！你已成功登录。</p>
          <button @click="logout">退出登录</button>
        </div>
      </template>
      <script setup>
      import { useRouter } from 'vue-router';
      const router = useRouter();
      function logout() {
        // 1. 清除token
        localStorage.removeItem('token');
        // 2. 跳转回登录页
        router.push('/login');
      }
      </script>