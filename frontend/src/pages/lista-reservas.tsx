import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, CalendarIcon, Search } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { ApiError } from "@/api/axios"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import { obtenerReservas, obtenerHoteles, obtenerClientes, type FiltroReservas } from "@/api/reserva"

// Esquema de validación para el formulario de filtros
const filtroSchema = z.object({
  hotelId: z.string({
    required_error: "El hotel es requerido",
  }),
  fechaEntrada: z.date({
    required_error: "La fecha de entrada es requerida",
  }),
  fechaSalida: z.date().optional(),
  clienteId: z.string().optional(),
})

type FiltroFormValues = z.infer<typeof filtroSchema>

export default function ListaReservas() {
  const [filtros, setFiltros] = useState<FiltroReservas | null>(null)

  // Consulta para obtener hoteles
  const {
    data: hoteles,
    isLoading: isLoadingHoteles,
    isError: isErrorHoteles,
  } = useQuery({
    queryKey: ["hoteles"],
    queryFn: obtenerHoteles,
  })

  // Consulta para obtener clientes
  const {
    data: clientes,
    isLoading: isLoadingClientes,
    isError: isErrorClientes,
  } = useQuery({
    queryKey: ["clientes"],
    queryFn: obtenerClientes,
  })

  // Consulta para obtener lista de reservas
  const {
    data: reservas = [],
    isLoading: isLoadingReservas,
    isError: isErrorReservas,
    error: errorReservas,
  } = useQuery({
    queryKey: ["reservas", filtros],
    queryFn: () => obtenerReservas(filtros || undefined),
    enabled: filtros !== null,
    retry: 1, // Reintentar solo una vez
  })

  // Configurar formulario con validación
  const form = useForm<FiltroFormValues>({
    resolver: zodResolver(filtroSchema),
    defaultValues: {
      hotelId: "",
      clienteId: "",
    },
  })

  // Manejar envío del formulario
  const onSubmit = (values: FiltroFormValues) => {
    const nuevosFiltros: FiltroReservas = {
      hotelId: Number.parseInt(values.hotelId),
      fechaEntrada: format(values.fechaEntrada, "yyyy-MM-dd"),
      fechaSalida: values.fechaSalida ? format(values.fechaSalida, "yyyy-MM-dd") : undefined,
      clienteId: values.clienteId ? Number.parseInt(values.clienteId) : undefined,
    }
    setFiltros(nuevosFiltros)
  }


  // Extraer mensaje de error de la API
  const apiError = errorReservas as ApiError | undefined
  const errorMessage = apiError?.message || "Error al cargar las reservas."

  // Verificar si hay errores en la carga de datos necesarios para el formulario
  const hayErrorDatos = isErrorHoteles || isErrorClientes
  const estanCargandoDatos = isLoadingHoteles || isLoadingClientes

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lista de Reservas</h1>
        <p className="text-muted-foreground">Visualice y filtre las reservas registradas en el sistema.</p>
      </div>

      {hayErrorDatos ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudieron cargar los datos necesarios para el filtrado. Por favor, intente nuevamente.
          </AlertDescription>
        </Alert>
      ) : (

        <Card>
          <CardHeader>
            <CardTitle>Filtros de búsqueda</CardTitle>
            <CardDescription>
              Complete los campos para filtrar las reservas. Hotel y fecha de entrada son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {estanCargandoDatos ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="hotelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotel</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un hotel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hoteles?.map((hotel) => (
                                <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                  {hotel.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Obligatorio para filtrar reservas.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clienteId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un cliente (opcional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clientes?.map((cliente) => (
                                <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                  {cliente.nombre} {cliente.apellido} - {cliente.cedula}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Opcional. Filtra por cliente específico.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fechaEntrada"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de entrada</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
                                    }`}
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
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>Obligatorio para filtrar reservas.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fechaSalida"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de salida</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
                                    }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Seleccione una fecha (opcional)</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={(date) => field.onChange(date)}
                                disabled={(date) =>
                                  form.getValues().fechaEntrada && date < form.getValues().fechaEntrada
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>Opcional. Filtra hasta una fecha específica.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full sm:w-auto">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Reservas
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}

      {filtros && (
        <Card>
          <CardHeader>
            <CardTitle>Reservas</CardTitle>
            <CardDescription>Listado de reservas filtradas por los criterios seleccionados.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingReservas ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : isErrorReservas ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : reservas.length > 0 ? (
              <Table>
                <TableCaption>Lista de reservas filtradas</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Habitación</TableHead>
                    <TableHead>Piso</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha Entrada</TableHead>
                    <TableHead>Fecha Salida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservas.map((reserva) => (
                    <TableRow key={reserva.id}>
                      <TableCell>{reserva.Hotel.nombre}</TableCell>
                      <TableCell>{reserva.Habitacion.numero}</TableCell>
                      <TableCell>{reserva.Habitacion.piso}</TableCell>
                      <TableCell>
                        {reserva.Cliente.nombre} {reserva.Cliente.apellido}
                      </TableCell>
                      <TableCell>{format(new Date(reserva.fecha_ingreso), "PPP", { locale: es })}</TableCell>
                      <TableCell>{format(new Date(reserva.fecha_salida), "PPP", { locale: es })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron reservas con los criterios seleccionados.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
