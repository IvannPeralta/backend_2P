import { useState } from "react"
import { useNavigate, useLocation } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buscarUsuario, crearUsuario, crearReserva } from "@/api/reserva"

// Esquema de validación para usuario
const usuarioSchema = z.object({
  cedula: z.string().min(5, {
    message: "La cédula debe tener al menos 5 caracteres",
  }),
  nombre: z
    .string()
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres",
    })
    .optional(),
  apellido: z
    .string()
    .min(2, {
      message: "El apellido debe tener al menos 2 caracteres",
    })
    .optional(),
})

type UsuarioFormValues = z.infer<typeof usuarioSchema>

export default function ReservarHabitacion() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  
  const habitacionId = searchParams.get('habitacionId')
  const fechaEntrada = searchParams.get('fechaEntrada')
  const fechaSalida = searchParams.get('fechaSalida')
  
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false)
  const [buscandoUsuario, setBuscandoUsuario] = useState(false)
  const [cedulaABuscar, setCedulaABuscar] = useState("")

  // Verificar parámetros de búsqueda
  const parametrosValidos = habitacionId && fechaEntrada && fechaSalida

  // Configurar formulario con validación
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      cedula: "",
      nombre: "",
      apellido: "",
    },
  })

  // Mutación para crear reserva
  const crearReservaMutation = useMutation({
    mutationFn: crearReserva,
    onSuccess: () => {
      navigate("/")
    },
  })

  // Buscar usuario por cédula
  const buscarUsuarioPorCedula = async (cedula: string) => {
    setBuscandoUsuario(true)
    try {
      const usuario = await buscarUsuario(cedula)
      if (usuario) {
        form.setValue("nombre", usuario.nombre)
        form.setValue("apellido", usuario.apellido)
        setUsuarioEncontrado(true)
      } else {
        form.setValue("nombre", "")
        form.setValue("apellido", "")
        setUsuarioEncontrado(false)
      }
    } catch (error) {
      console.error("Error al buscar usuario:", error)
      setUsuarioEncontrado(false)
    } finally {
      setBuscandoUsuario(false)
    }
  }

  // Manejar envío del formulario
  const onSubmit = async (values: UsuarioFormValues) => {
    if (!parametrosValidos) return

    // Si el usuario no existe, crearlo primero
    if (!usuarioEncontrado && values.nombre && values.apellido) {
      await crearUsuario({
        cedula: values.cedula,
        nombre: values.nombre,
        apellido: values.apellido,
      })
    }

    // Crear la reserva
    crearReservaMutation.mutate({
      habitacionId: Number.parseInt(habitacionId),
      fechaEntrada: fechaEntrada,
      fechaSalida: fechaSalida,
      cedula: values.cedula,
    })
  }

  if (!parametrosValidos) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
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
          <CardDescription>
            Habitación seleccionada para las fechas del {fechaEntrada} al {fechaSalida}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
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
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e)
                              setCedulaABuscar(e.target.value)
                              setUsuarioEncontrado(false)
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => buscarUsuarioPorCedula(cedulaABuscar)}
                          disabled={!cedulaABuscar || cedulaABuscar.length < 5 || buscandoUsuario}
                        >
                          {buscandoUsuario ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {usuarioEncontrado && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>Usuario encontrado</AlertTitle>
                    <AlertDescription>Se han cargado sus datos automáticamente.</AlertDescription>
                  </Alert>
                )}

                {!usuarioEncontrado && (
                  <>
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingrese su nombre" {...field} />
                          </FormControl>
                          <FormDescription>Requerido si es un nuevo usuario.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingrese su apellido" {...field} />
                          </FormControl>
                          <FormDescription>Requerido si es un nuevo usuario.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  crearReservaMutation.isPending ||
                  (!usuarioEncontrado && (!form.watch("nombre") || !form.watch("apellido")))
                }
              >
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
    </div>
  )
}
