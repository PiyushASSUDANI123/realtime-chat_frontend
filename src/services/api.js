import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ Notes API ============

export const fetchNotes = async (subject) => {
  const params = subject ? { subject } : {};
  const res = await api.get('/notes', { params });
  return res.data;
};

export const fetchNote = async (id) => {
  const res = await api.get(`/notes/${id}`);
  return res.data;
};

export const createNote = async (noteData) => {
  const res = await api.post('/notes', noteData);
  return res.data;
};

export const updateNote = async (id, noteData) => {
  const res = await api.put(`/notes/${id}`, noteData);
  return res.data;
};

export const deleteNote = async (id) => {
  const res = await api.delete(`/notes/${id}`);
  return res.data;
};

// ============ Auth API ============

export const loginWithPhrase = async (phrase) => {
  const res = await api.post('/auth/login', { phrase });
  return res.data;
};

// ============ Messages API ============

export const fetchMessages = async (userId) => {
  const res = await api.get('/messages', { params: { userId } });
  return res.data;
};

// ============ Upload API ============

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('media', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export default api;
