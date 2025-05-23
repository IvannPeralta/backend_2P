import axios from "axios"

// Create axios instance with base URL
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9090/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error: unknown) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: unknown) => {
    // Check if error is an axios error with response property
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 401
    ) {
      localStorage.removeItem("token")

      // Redirect to login page if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

// Interfaz para errores de API
export interface ApiError {
  message: string
  status?: number
  details?: any
}

// Función auxiliar para manejar errores de API
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    return {
      message: error.response.data.message || "Error en la solicitud",
      status: error.response.status,
      details: error.response.data
    }
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    return {
      message: "No se recibió respuesta del servidor",
      details: error.request
    }
  } else {
    // Ocurrió un error al configurar la solicitud
    return {
      message: error.message || "Error al realizar la solicitud"
    }
  }
}