import { api, handleApiError } from "./axios"

export interface BusquedaDisponibilidad {
  fecha_ingreso: string
  fecha_salida: string
  cantidad_personas?: number | string | undefined
}

export interface Habitacion {
  id: number
  hotel: string
  numero: string
  caracteristicas: string
  piso: number
  capacidad: number
}

export interface Hotel {
  id: number
  nombre: string
  direccion: string
  telefono: string
}

export interface Cliente {
  id: number
  cedula: string
  nombre: string
  apellido: string
}

export interface Usuario {
  cedula: string
  nombre: string
  apellido: string
}

export interface Reserva {
  id?: number
  fechaEntrada: string
  fechaSalida: string
  habitacionId: number
  cedula: string
  // Campos adicionales para mostrar en la lista
  hotel?: string
  numeroHabitacion?: string
  pisoHabitacion?: number
  nombreCliente?: string
  apellidoCliente?: string
}

export interface FiltroReservas {
  hotelId: number
  fechaEntrada: string
  fechaSalida?: string
  clienteId?: number
}

// Buscar habitaciones disponibles
export const buscarHabitacionesDisponibles = async (busqueda: BusquedaDisponibilidad): Promise<Habitacion[]> => {
  try {
    const response = await api.post("/reserva/buscarDisponibles/", busqueda)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Crear una nueva reserva
export const crearReserva = async (reserva: Reserva): Promise<Reserva> => {
  try {
    const response = await api.post("/reserva/", reserva)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Obtener lista de reservas con filtros
export const obtenerReservas = async (filtros?: FiltroReservas): Promise<Reserva[]> => {
  try {
    // Si hay filtros, añadirlos como parámetros de consulta
    const params = filtros ? new URLSearchParams() : undefined

    if (filtros) {
      params?.append("id_hotel", filtros.hotelId.toString())
      params?.append("fecha_ingreso", filtros.fechaEntrada)

      if (filtros.fechaSalida) {
        params?.append("fecha_salida", filtros.fechaSalida)
      }

      if (filtros.clienteId) {
        params?.append("id_cliente", filtros.clienteId.toString())
      }
    }

    const url = filtros ? `/reserva/listReservas?${params?.toString()}` : "/reserva/listReservas"
    const response = await api.get(url)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Buscar usuario por cédula (simulado, ya que no está en el backend proporcionado)
export const buscarUsuario = async (cedula: string): Promise<Usuario | null> => {
  try {
    const response = await api.get(`/usuario/${cedula}/`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Crear usuario (simulado, ya que no está en el backend proporcionado)
export const crearUsuario = async (usuario: Usuario): Promise<Usuario> => {
  try {
    const response = await api.post("/usuario", usuario)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Obtener todos los hoteles
export const obtenerHoteles = async (): Promise<Hotel[]> => {
  try {
    const response = await api.get("/hotel")
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Obtener un hotel por ID
export const obtenerHotelPorId = async (id: number): Promise<Hotel> => {
  try {
    const response = await api.get(`/hotel/${id}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Obtener todos los clientes
export const obtenerClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await api.get("/cliente")
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Obtener un cliente por ID
export const obtenerClientePorId = async (id: number): Promise<Cliente> => {
  try {
    const response = await api.get(`/cliente/${id}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Obtener una habitación por ID
export const obtenerHabitacionPorId = async (id: number): Promise<Habitacion> => {
  try {
    const response = await api.get(`/habitacion/${id}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
