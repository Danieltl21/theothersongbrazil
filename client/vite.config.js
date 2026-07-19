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
        about: resolve(__dirname, 'sobre-nos.html'),
        homeopaths: resolve(__dirname, 'homeopatas.html'),
        books: resolve(__dirname, 'livros.html'),
        synergy: resolve(__dirname, 'software-synergy.html'),
        contact: resolve(__dirname, 'contato.html'),
        cart: resolve(__dirname, 'carrinho.html'),
        login: resolve(__dirname, 'entrar.html'),
        register: resolve(__dirname, 'cadastro.html'),
        unlock: resolve(__dirname, 'desbloquear.html'),
        student_dash: resolve(__dirname, 'painel-aluno.html'),
        course_view: resolve(__dirname, 'assistir-aula.html'),
        teacher_dash: resolve(__dirname, 'painel-professor.html'),
        admin_dash: resolve(__dirname, 'painel-administrador.html'),
        course_detail: resolve(__dirname, 'detalhes-curso.html'),
        checkout: resolve(__dirname, 'finalizar-compra.html')
      }
    }
  }
});

