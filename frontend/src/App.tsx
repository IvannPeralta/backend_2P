import { Routes, Route } from "react-router"
import { Link, Outlet } from "react-router"
import { ModeToggle } from "@/components/mode-toggle"

import BuscarHabitaciones from "./pages/buscar-habitaciones"
import ReservarHabitacion from "./pages/reservar-habitacion"
import ListaReservas from "./pages/lista-reservas"

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center m-auto">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2 font-bold">
              <span>Sistema de Reservas</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-foreground/80">
                Buscar Habitaciones
              </Link>
              <Link to="/lista-reservas" className="transition-colors hover:text-foreground/80">
                Lista de Reservas
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="container py-6 m-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<BuscarHabitaciones />} />
        <Route path="reservar" element={<ReservarHabitacion />} />
        <Route path="lista-reservas" element={<ListaReservas />} />
      </Route>
    </Routes>
  )
}

