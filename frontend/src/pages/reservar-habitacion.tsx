
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CalendarIcon, Check, Loader2, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { buscarUsuario, crearUsuario, crearReserva } from "@/api/reserva"
import type { ApiError } from "@/api/axios"

// Esquema de validación para el formulario de reserva
const reservaSchema = z.object({
  cedula: z.string().min(5, {
    message: "La cédula debe tener al menos 5 caracteres",
  }),
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  apellido: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres",
  }),
  cantidad_personas: z
    .number()
    .transform((val) => Number(val))
    .refine((val) => val > 0, {
      message: "La cantidad de personas debe ser mayor a 0",
    }),
  fecha_salida: z
    .date({
      required_error: "La fecha de salida es requerida",
    })
    .refine((date) => date > new Date(), {
      message: "La fecha de salida debe ser posterior a hoy",
    }),
})

type ReservaFormValues = z.infer<typeof reservaSchema>

export default function ReservarHabitacion() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const habitacionId = searchParams.get("habitacionId")
  const hotelId = searchParams.get("hotelId")
  const fechaEntrada = searchParams.get("fechaEntrada")
  const fechaSalida = searchParams.get("fechaSalida")
  const capacidadMaxima = searchParams.get("capacidadMaxima");
  const capacidad = searchParams.get("capacidad") 
    ? Math.min(parseInt(searchParams.get("capacidad")!), parseInt(capacidadMaxima!)) 
    : 1;  

  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false)
  const [buscandoUsuario, setBuscandoUsuario] = useState(false)
  const [cedulaABuscar, setCedulaABuscar] = useState("")
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [clienteId, setClienteId] = useState<number>()
  const [reservaExitosa, setReservaExitosa] = useState(false)

  // Verificar parámetros de búsqueda
  const parametrosValidos = habitacionId && hotelId && fechaEntrada

  // Configurar formulario con validación
  const form = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      cedula: "",
      nombre: "",
      apellido: "",
      cantidad_personas: capacidad,
      fecha_salida: fechaSalida ? new Date(`${fechaSalida}T00:00:00`) : undefined,
    },
  });

  // Efecto para actualizar el formulario cuando cambian los parámetros de URL
  useEffect(() => {
    if (capacidad) {
      form.setValue("cantidad_personas", capacidad);
    }
    if (fechaSalida) {
      form.setValue("fecha_salida", new Date(`${fechaSalida}T00:00:00`))
    }
  }, [capacidad, fechaSalida, form])

  // Mutación para crear reserva
  const crearReservaMutation = useMutation({
    mutationFn: crearReserva,
    onSuccess: () => {
      setReservaExitosa(true)
    },
    onError: (error: ApiError) => {
      console.error("Error al crear reserva:", error.message)
    },
  })

  // Buscar usuario por cédula
  const buscarUsuarioPorCedula = async (cedula: string) => {
    if (!cedula || cedula.length < 5) return

    setBuscandoUsuario(true)
    setErrorBusqueda(null)
    try {
      const usuario = await buscarUsuario(cedula)
      if (usuario) {
        // Actualizar los campos del formulario con los datos del usuario
        form.setValue("nombre", usuario.nombre)
        form.setValue("apellido", usuario.apellido)
        setUsuarioEncontrado(true)
        setClienteId(usuario.id)
      } else {
        setUsuarioEncontrado(false)
      }
    } catch (error) {
      const apiError = error as ApiError
      console.error("Error al buscar usuario:", apiError.message)
      setErrorBusqueda(apiError.message)
      setUsuarioEncontrado(false)
    } finally {
      setBuscandoUsuario(false)
    }
  }

  // Efecto para buscar usuario cuando cambia la cédula
  useEffect(() => {
    const cedula = form.watch("cedula")
    if (cedula && cedula.length >= 5 && cedula !== cedulaABuscar) {
      setCedulaABuscar(cedula)
      buscarUsuarioPorCedula(cedula)
    }
  }, [form.watch("cedula")])

  // Manejar envío del formulario
  const onSubmit = async (values: ReservaFormValues) => {
    if (!parametrosValidos || !hotelId || !habitacionId || !fechaEntrada) return
    const cantidadSolicitada = Number(values.cantidad_personas);
    const capacidadHabitacion = Number(capacidad);

    if (cantidadSolicitada > capacidadHabitacion) {
      form.setError("cantidad_personas", {
        message: `La capacidad máxima de esta habitación es ${capacidadHabitacion}`,
      });
      return;
    }
    try {

      let finalClienteId = clienteId

      // Si el usuario no existe, crearlo primero
      if (!usuarioEncontrado) {
        try {
          const cliente = await crearUsuario({
            cedula: values.cedula,
            nombre: values.nombre,
            apellido: values.apellido,
          })
          setClienteId(cliente.id)
          finalClienteId = cliente.id
        } catch (error) {
          const apiError = error as ApiError
          console.error("Error al crear usuario:", apiError.message)
          setErrorBusqueda(apiError.message)
          return
        }
      }

      if (!finalClienteId) {
        throw new Error("No se pudo obtener el ID del cliente.")
      }
      // Crear la reserva con el formato actualizado
      crearReservaMutation.mutate({
        id_hotel: Number.parseInt(hotelId),
        id_habitacion: Number.parseInt(habitacionId),
        fecha_ingreso: fechaEntrada,
        fecha_salida: format(values.fecha_salida, "yyyy-MM-dd"),
        id_cliente: finalClienteId,
        cantidad_personas: Number.parseInt(values.cantidad_personas.toString()),
      })
    } catch (error) {
      const apiError = error as ApiError
      console.error("Error al procesar la reserva:", apiError.message)
    }
  }

  // Manejar cierre del modal de éxito
  const handleCloseModal = () => {
    setReservaExitosa(false)
    navigate("/")
  }

  if (!parametrosValidos) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Faltan parámetros necesarios para realizar la reserva. Por favor, busque habitaciones disponibles primero.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/")}>Volver a la búsqueda</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Completar Reserva</h1>
        <p className="text-muted-foreground">Complete sus datos personales para finalizar la reserva.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la reserva</CardTitle>
          <CardDescription>Habitación seleccionada para estancia a partir del {fechaEntrada}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Fecha de salida */}
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Fecha en que finalizará su estancia.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cantidad de personas */}
                <FormField
                  control={form.control}
                  name="cantidad_personas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad de personas</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={1}
                            placeholder="Número de personas"
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Número de personas que se alojarán.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datos del cliente</h3>

                {/* Cédula */}
                <FormField
                  control={form.control}
                  name="cedula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            placeholder="Ingrese su cédula"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              if (e.target.value.length < 5) {
                                setUsuarioEncontrado(false)
                                setErrorBusqueda(null)
                              }
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>Ingrese su cédula para buscar sus datos automáticamente.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {buscandoUsuario && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Buscando usuario...</span>
                  </div>
                )}

                {errorBusqueda && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorBusqueda}</AlertDescription>
                  </Alert>
                )}

                {usuarioEncontrado && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>Usuario encontrado</AlertTitle>
                    <AlertDescription>Se han cargado sus datos automáticamente.</AlertDescription>
                  </Alert>
                )}

                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Apellido */}
                <FormField
                  control={form.control}
                  name="apellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {crearReservaMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error al crear la reserva</AlertTitle>
                  <AlertDescription>
                    {(crearReservaMutation.error as ApiError).message || "Ocurrió un error al procesar su reserva."}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={crearReservaMutation.isPending}>
                {crearReservaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Reserva
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            Cancelar
          </Button>
        </CardFooter>
      </Card>

      {/* Modal de reserva exitosa */}
      <Dialog open={reservaExitosa} onOpenChange={setReservaExitosa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Reserva Confirmada!</DialogTitle>
            <DialogDescription>
              Su reserva ha sido registrada exitosamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseModal} className="w-full">
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
