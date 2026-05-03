const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api`
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

async function request(path, options = {}) {
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}

export const api = {
  signin(credentials) {
    return request('/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  signup(details) {
    return request('/signup', {
      method: 'POST',
      body: JSON.stringify(details),
    })
  },

  getCourses(token) {
    return request('/courses', { token })
  },

  createCourse(token, course) {
    return request('/courses', {
      method: 'POST',
      token,
      body: JSON.stringify(course),
    })
  },

  analyzeModeAVideo(token, courseId, videoFile, details) {
    const body = new FormData()
    body.append('video', videoFile)
    body.append('title', details.lectureTitle || 'Mode A lecture analysis')
    body.append('lectureDate', details.lectureDate || new Date().toISOString())
    body.append('section', details.section || '')
    body.append('notes', details.notes || '')

    return request(`/mode-a/courses/${courseId}/lectures/analyze-video`, {
      method: 'POST',
      token,
      body,
    })
  },

  modeBStreamUrl(token, classroom) {
    let url = `${API_ORIGIN}/api/mode-b/simulation/stream?token=${encodeURIComponent(token)}`
    if (classroom) {
      url += `&classroom=${encodeURIComponent(classroom)}`
    }
    return url
  },

  createAssessment(token, data) {
    return request('/mode-b/assessments', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    })
  },

  getAssessments(token) {
    return request('/mode-b/assessments', { token })
  },

  getAssessment(token, id) {
    return request(`/mode-b/assessments/${id}`, { token })
  },

  finalizeAssessment(token, id, alerts) {
    return request(`/mode-b/assessments/${id}/finalize`, {
      method: 'POST',
      token,
      body: JSON.stringify({ alerts }),
    })
  },
}
