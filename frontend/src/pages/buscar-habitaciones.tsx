
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { buscarHabitacionesDisponibles, type Habitacion, type BusquedaDisponibilidad, obtenerHoteles } from "@/api/reserva"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ApiError } from "@/api/axios"

// Esquema de validación sin transformación
const busquedaSchema = z
  .object({
    fecha_ingreso: z.date({
      required_error: "La fecha de entrada es requerida",
    }),
    fecha_salida: z
      .date({
        required_error: "La fecha de salida es requerida",
      })
      .refine((date) => date > new Date(), {
        message: "La fecha de salida debe ser posterior a hoy",
      }),
    cantidad_personas: z.string().optional(),
  })
  .refine((data) => data.fecha_salida > data.fecha_ingreso, {
    message: "La fecha de salida debe ser posterior a la fecha de entrada",
    path: ["fechaSalida"],
  })

// Tipo para el formulario
type BusquedaFormValues = z.infer<typeof busquedaSchema>

// Interfaz para habitaciones con información de hotel
interface HabitacionConHotel extends Habitacion {
  nombreHotel?: string
}

export default function BuscarHabitaciones() {
  const navigate = useNavigate()
  const [busquedaParams, setBusquedaParams] = useState<BusquedaDisponibilidad | null>(null)
  const [habitacionesConHotel, setHabitacionesConHotel] = useState<HabitacionConHotel[]>([])

  // Configurar formulario con validación
  const form = useForm<BusquedaFormValues>({
    resolver: zodResolver(busquedaSchema),
    defaultValues: {
      cantidad_personas: "",
    },
  })

  // Consulta para obtener hoteles
  const {
    data: hoteles,
    isLoading: isLoadingHoteles,
    isError: isErrorHoteles,
  } = useQuery({
    queryKey: ["hoteles"],
    queryFn: obtenerHoteles,
  })

  // Consulta para buscar habitaciones disponibles
  const {
    data: habitaciones,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["habitacionesDisponibles", busquedaParams],
    queryFn: () => (busquedaParams ? buscarHabitacionesDisponibles(busquedaParams) : Promise.resolve([])),
    enabled: !!busquedaParams,
  })

  useEffect(() => {
    if (!habitaciones || !hoteles) {
      setHabitacionesConHotel([])
      return
    }

    const hotelMap = new Map<string, string>(
      hoteles.map((hotel) => [hotel.id, hotel.nombre])
    )

    const habitacionesActualizadas: HabitacionConHotel[] = habitaciones.map((habitacion) => ({
      ...habitacion,
      nombreHotel: hotelMap.get(habitacion?.id) || "Desconocido",
    }))

    setHabitacionesConHotel(habitacionesActualizadas)
  }, [habitaciones, hoteles])


  // Extraer mensaje de error de la API
  const apiError = error as ApiError | undefined
  const errorMessage = apiError?.message || "Error al cargar las habitaciones disponibles."

  // Manejar envío del formulario
  const onSubmit = (values: BusquedaFormValues) => {
    const params: BusquedaDisponibilidad = {
      fecha_ingreso: format(values.fecha_ingreso, "yyyy-MM-dd"),
      fecha_salida: format(values.fecha_salida, "yyyy-MM-dd"),
      // Convertir a número aquí en lugar de en el esquema
      cantidad_personas: values.cantidad_personas && values.cantidad_personas !== "" ? Number.parseInt(values.cantidad_personas, 10) : undefined,
    }
    setBusquedaParams(params)
  }

  // Manejar selección de habitación
  const seleccionarHabitacion = (habitacion: Habitacion) => {
    if (!busquedaParams) return

    navigate(
      `/reservar?habitacionId=${habitacion.id}&hotelId=${habitacion.id}&fechaEntrada=${busquedaParams.fecha_ingreso}&fechaSalida=${busquedaParams.fecha_salida}&capacidad=${busquedaParams.cantidad_personas || 1}`,
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buscar Habitaciones Disponibles</h1>
        <p className="text-muted-foreground">
          Ingrese las fechas de su estadía y la capacidad deseada para encontrar habitaciones disponibles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criterios de búsqueda</CardTitle>
          <CardDescription>Complete los campos para buscar habitaciones disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="fecha_ingreso"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de entrada</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_salida"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de salida</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const today = new Date(new Date().setHours(0, 0, 0, 0));
                              const fechaIngreso = form.getValues().fecha_ingreso;

                              return date < today || (fechaIngreso && date < new Date(fechaIngreso));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cantidad_personas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad (personas)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Capacidad" min={1} {...field} />
                      </FormControl>
                      <FormDescription>Opcional. Número de personas que se alojarán.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Buscar Habitaciones
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {busquedaParams && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de la búsqueda</CardTitle>
            <CardDescription>
              Habitaciones disponibles del {busquedaParams.fecha_ingreso} al {busquedaParams.fecha_salida}
              {busquedaParams.cantidad_personas ? ` para ${busquedaParams.cantidad_personas} personas` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && isLoadingHoteles ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : isError && isErrorHoteles ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : habitacionesConHotel && habitacionesConHotel.length > 0 ? (
              <Table>
                <TableCaption>Lista de habitaciones disponibles</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Habitación</TableHead>
                    <TableHead>Características</TableHead>
                    <TableHead>Piso</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {habitacionesConHotel.map((habitacion) => (
                    <TableRow key={habitacion.id}>
                      <TableCell className="font-medium">{habitacion.nombreHotel || habitacion.hotel}</TableCell>
                      <TableCell>{habitacion.numero}</TableCell>
                      <TableCell>{habitacion.caracteristicas}</TableCell>
                      <TableCell>{habitacion.piso}</TableCell>
                      <TableCell>{habitacion.capacidad} personas</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => seleccionarHabitacion(habitacion)}>
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron habitaciones disponibles con los criterios seleccionados.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

