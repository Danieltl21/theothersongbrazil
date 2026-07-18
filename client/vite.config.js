import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        homeopaths: resolve(__dirname, 'homeopaths.html'),
        books: resolve(__dirname, 'books.html'),
        synergy: resolve(__dirname, 'synergy.html'),
        contact: resolve(__dirname, 'contact.html'),
        cart: resolve(__dirname, 'cart.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        unlock: resolve(__dirname, 'unlock.html'),
        student_dash: resolve(__dirname, 'student-dash.html'),
        course_view: resolve(__dirname, 'course-view.html'),
        teacher_dash: resolve(__dirname, 'teacher-dash.html'),
        admin_dash: resolve(__dirname, 'admin-dash.html'),
        course_detail: resolve(__dirname, 'course-detail.html'),
        checkout: resolve(__dirname, 'checkout.html')
      }
    }
  }
});

