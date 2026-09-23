const API_BASE_URL = 'http://localhost:5000/api';

export function getAuthHeader() {
  const token = localStorage.getItem('tosb_token') || localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader()
  };

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Erro no servidor (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

// APIs Específicas
export const api = {
  // Autenticação
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  register: (userData) => apiRequest('/auth/register', 'POST', userData),
  getMe: () => apiRequest('/auth/me', 'GET'),
  updateProfile: (profileData) => apiRequest('/auth/profile', 'PUT', profileData),
  
  // Usuários (ADM)
  getAdminUsers: () => apiRequest('/auth/admin/users', 'GET'),
  createAdminUser: (userData) => apiRequest('/auth/admin/users', 'POST', userData),
  updateAdminUser: (id, userData) => apiRequest(`/auth/admin/users/${id}`, 'PUT', userData),
  deleteAdminUser: (id) => apiRequest(`/auth/admin/users/${id}`, 'DELETE'),

  // Cursos
  getCourses: () => apiRequest('/courses/all-admin', 'GET'),
  getPublicCourses: (type) => apiRequest(`/courses${type ? `?type=${type}` : ''}`, 'GET'),
  getCourseDetails: (id) => apiRequest(`/courses/${id}`, 'GET'),
  createCourse: (courseData) => apiRequest('/courses/admin', 'POST', courseData),
  updateCourse: (id, courseData) => apiRequest(`/courses/admin/${id}`, 'PUT', courseData),
  deleteCourse: (id) => apiRequest(`/courses/admin/${id}`, 'DELETE'),

  // Módulos e Aulas
  createModule: (courseId, moduleData) => apiRequest(`/courses/admin/${courseId}/modules`, 'POST', moduleData),
  updateModule: (id, moduleData) => apiRequest(`/courses/admin/modules/${id}`, 'PUT', moduleData),
  deleteModule: (id) => apiRequest(`/courses/admin/modules/${id}`, 'DELETE'),
  
  createLesson: (moduleId, lessonData) => apiRequest(`/courses/admin/modules/${moduleId}/lessons`, 'POST', lessonData),
  updateLesson: (id, lessonData) => apiRequest(`/courses/admin/lessons/${id}`, 'PUT', lessonData),
  deleteLesson: (id) => apiRequest(`/courses/admin/lessons/${id}`, 'DELETE'),

  // Livros
  getBooks: () => apiRequest('/courses/books/all', 'GET'),
  saveBook: (bookData) => apiRequest('/courses/admin-books', 'POST', bookData),
  deleteBook: (id) => apiRequest(`/courses/admin-books/${id}`, 'DELETE')
};

export default api;
