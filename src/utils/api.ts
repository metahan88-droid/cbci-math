import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7e316a07`;
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// LocalStorage 기반 데이터 저장 (Edge Function이 배포되지 않은 경우 사용)
const USE_LOCALSTORAGE = true; // Edge Function 배포 후 false로 변경

// LocalStorage helper functions
const storage = {
  get: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage error:', error);
    }
  }
};

// Helper function for better error handling
const handleFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    
    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      return { success: false, data: [], error: `HTTP ${res.status}: ${res.statusText}` };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    // Return empty data on network error to prevent app crash
    return { success: true, data: [], error: String(error) };
  }
};

// 공지사항 API
export const noticesAPI = {
  getAll: async () => {
    if (USE_LOCALSTORAGE) {
      const data = storage.get('notices');
      return { success: true, data };
    }
    return handleFetch(`${API_URL}/notices`);
  },
  create: async (notice: any) => {
    if (USE_LOCALSTORAGE) {
      const notices = storage.get('notices');
      notices.unshift(notice);
      storage.set('notices', notices);
      return { success: true, data: notice };
    }
    return handleFetch(`${API_URL}/notices`, {
      method: 'POST',
      body: JSON.stringify(notice)
    });
  },
  update: async (id: string, notice: any) => {
    if (USE_LOCALSTORAGE) {
      const notices = storage.get('notices');
      const index = notices.findIndex((n: any) => n.id === id);
      if (index !== -1) {
        notices[index] = { ...notices[index], ...notice };
        storage.set('notices', notices);
        return { success: true, data: notices[index] };
      }
      return { success: false, error: 'Notice not found' };
    }
    return handleFetch(`${API_URL}/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notice)
    });
  },
  delete: async (id: string) => {
    if (USE_LOCALSTORAGE) {
      const notices = storage.get('notices');
      const filtered = notices.filter((n: any) => n.id !== id);
      storage.set('notices', filtered);
      return { success: true };
    }
    return handleFetch(`${API_URL}/notices/${id}`, {
      method: 'DELETE'
    });
  }
};

// 수업자료 API
export const lessonsAPI = {
  getAll: async () => {
    if (USE_LOCALSTORAGE) {
      const data = storage.get('lessons');
      return { success: true, data };
    }
    return handleFetch(`${API_URL}/lessons`);
  },
  create: async (lesson: any) => {
    if (USE_LOCALSTORAGE) {
      const lessons = storage.get('lessons');
      lessons.unshift(lesson);
      storage.set('lessons', lessons);
      return { success: true, data: lesson };
    }
    return handleFetch(`${API_URL}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lesson)
    });
  },
  update: async (id: string, lesson: any) => {
    if (USE_LOCALSTORAGE) {
      const lessons = storage.get('lessons');
      const index = lessons.findIndex((l: any) => l.id === id);
      if (index !== -1) {
        lessons[index] = { ...lessons[index], ...lesson };
        storage.set('lessons', lessons);
        return { success: true, data: lessons[index] };
      }
      return { success: false, error: 'Lesson not found' };
    }
    return handleFetch(`${API_URL}/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lesson)
    });
  },
  delete: async (id: string) => {
    if (USE_LOCALSTORAGE) {
      const lessons = storage.get('lessons');
      const filtered = lessons.filter((l: any) => l.id !== id);
      storage.set('lessons', filtered);
      return { success: true };
    }
    return handleFetch(`${API_URL}/lessons/${id}`, {
      method: 'DELETE'
    });
  }
};

// 탐구자료 API
export const researchAPI = {
  getAll: async () => {
    if (USE_LOCALSTORAGE) {
      const data = storage.get('research');
      return { success: true, data };
    }
    return handleFetch(`${API_URL}/research`);
  },
  create: async (research: any) => {
    if (USE_LOCALSTORAGE) {
      const researchList = storage.get('research');
      researchList.unshift(research);
      storage.set('research', researchList);
      return { success: true, data: research };
    }
    return handleFetch(`${API_URL}/research`, {
      method: 'POST',
      body: JSON.stringify(research)
    });
  },
  update: async (id: string, research: any) => {
    if (USE_LOCALSTORAGE) {
      const researchList = storage.get('research');
      const index = researchList.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        researchList[index] = { ...researchList[index], ...research };
        storage.set('research', researchList);
        return { success: true, data: researchList[index] };
      }
      return { success: false, error: 'Research not found' };
    }
    return handleFetch(`${API_URL}/research/${id}`, {
      method: 'PUT',
      body: JSON.stringify(research)
    });
  },
  delete: async (id: string) => {
    if (USE_LOCALSTORAGE) {
      const researchList = storage.get('research');
      const filtered = researchList.filter((r: any) => r.id !== id);
      storage.set('research', filtered);
      return { success: true };
    }
    return handleFetch(`${API_URL}/research/${id}`, {
      method: 'DELETE'
    });
  }
};

// 평가자료 API
export const evaluationsAPI = {
  getAll: async () => {
    if (USE_LOCALSTORAGE) {
      const data = storage.get('evaluations');
      return { success: true, data };
    }
    return handleFetch(`${API_URL}/evaluations`);
  },
  create: async (evaluation: any) => {
    if (USE_LOCALSTORAGE) {
      const evaluations = storage.get('evaluations');
      evaluations.unshift(evaluation);
      storage.set('evaluations', evaluations);
      return { success: true, data: evaluation };
    }
    return handleFetch(`${API_URL}/evaluations`, {
      method: 'POST',
      body: JSON.stringify(evaluation)
    });
  },
  update: async (id: string, evaluation: any) => {
    if (USE_LOCALSTORAGE) {
      const evaluations = storage.get('evaluations');
      const index = evaluations.findIndex((e: any) => e.id === id);
      if (index !== -1) {
        evaluations[index] = { ...evaluations[index], ...evaluation };
        storage.set('evaluations', evaluations);
        return { success: true, data: evaluations[index] };
      }
      return { success: false, error: 'Evaluation not found' };
    }
    return handleFetch(`${API_URL}/evaluations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(evaluation)
    });
  },
  delete: async (id: string) => {
    if (USE_LOCALSTORAGE) {
      const evaluations = storage.get('evaluations');
      const filtered = evaluations.filter((e: any) => e.id !== id);
      storage.set('evaluations', filtered);
      return { success: true };
    }
    return handleFetch(`${API_URL}/evaluations/${id}`, {
      method: 'DELETE'
    });
  }
};

// CBCI 자료 API
export const cbciAPI = {
  getAll: async () => {
    if (USE_LOCALSTORAGE) {
      const data = storage.get('cbci');
      return { success: true, data };
    }
    return handleFetch(`${API_URL}/cbci`);
  },
  create: async (cbci: any) => {
    if (USE_LOCALSTORAGE) {
      const cbciList = storage.get('cbci');
      cbciList.unshift(cbci);
      storage.set('cbci', cbciList);
      return { success: true, data: cbci };
    }
    return handleFetch(`${API_URL}/cbci`, {
      method: 'POST',
      body: JSON.stringify(cbci)
    });
  },
  update: async (id: string, cbci: any) => {
    if (USE_LOCALSTORAGE) {
      const cbciList = storage.get('cbci');
      const index = cbciList.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        cbciList[index] = { ...cbciList[index], ...cbci };
        storage.set('cbci', cbciList);
        return { success: true, data: cbciList[index] };
      }
      return { success: false, error: 'CBCI not found' };
    }
    return handleFetch(`${API_URL}/cbci/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cbci)
    });
  },
  delete: async (id: string) => {
    if (USE_LOCALSTORAGE) {
      const cbciList = storage.get('cbci');
      const filtered = cbciList.filter((c: any) => c.id !== id);
      storage.set('cbci', filtered);
      return { success: true };
    }
    return handleFetch(`${API_URL}/cbci/${id}`, {
      method: 'DELETE'
    });
  }
};
