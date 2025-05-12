import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Interfaces
interface Habitacion {
    id: number;
    numero: number;
    hotelId: number;
    posicion_x: number;
    posicion_y: number;
    piso: string;
    capacidad: number;
    caracteristicas?: string;
}

interface Hotel {
    id: number;
    nombre: string;
}

type HabitacionesPorPiso = Record<string, Habitacion[]>; // piso -> habitaciones
type HabitacionesPorHotel = Record<number, HabitacionesPorPiso>; // hotelId -> pisos

const MapaHabitacion: React.FC = () => {
    const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
    const [agrupado, setAgrupado] = useState<HabitacionesPorHotel>({});
    const [hoteles, setHoteles] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const hotelesRes = await axios.get<Hotel[]>('http://localhost:9090/api/hotel');
                setHoteles(hotelesRes.data);

                const habitacionesRes = await axios.get<Habitacion[]>('http://localhost:9090/api/habitacion');
                setHabitaciones(habitacionesRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Error al traer datos:", err);
                setLoading(false);
            }
        };

        fetchDatos();
    }, []);

    useEffect(() => {
        const agrupadoPorHotel: HabitacionesPorHotel = {};

        habitaciones.forEach((h) => {
            if (!agrupadoPorHotel[h.hotelId]) agrupadoPorHotel[h.hotelId] = {};
            if (!agrupadoPorHotel[h.hotelId][h.piso]) agrupadoPorHotel[h.hotelId][h.piso] = [];
            agrupadoPorHotel[h.hotelId][h.piso].push(h);
        });

        setAgrupado(agrupadoPorHotel);
    }, [habitaciones]);

    const obtenerNombreHotel = (id: number) => {
        const hotel = hoteles.find(h => h.id === id);
        return hotel ? hotel.nombre : `Hotel ID: ${id}`;
    };

    const ajustarPosiciones = (habitaciones: Habitacion[]) => {
        const posicionesOcupadas = new Set<string>();
        const ajustadas: Habitacion[] = [];

        for (const h of habitaciones) {
            let { posicion_x, posicion_y } = h;
            let key = `${posicion_x}_${posicion_y}`;

            while (posicionesOcupadas.has(key)) {
                posicion_x += 10;
                posicion_y += 10;
                key = `${posicion_x}_${posicion_y}`;
            }

            posicionesOcupadas.add(key);
            ajustadas.push({ ...h, posicion_x, posicion_y });
        }

        return ajustadas;
    };

    if (loading) {
        return <div>Cargando datos...</div>;
    }

    return (
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            {Object.entries(agrupado).map(([hotelId, pisos]) => (
                <div key={hotelId}>
                    <h2>{obtenerNombreHotel(Number(hotelId))}</h2>
                    {Object.entries(pisos).map(([piso, habitacionesPiso]) => (
                        <div key={piso}>
                            <h4>Piso: {piso}</h4>
                            <div
                                style={{
                                    position: 'relative',
                                    border: '1px solid #ccc',
                                    width: '400px',
                                    height: '300px',
                                    marginBottom: '20px',
                                    backgroundColor: '#f9f9f9',
                                }}
                            >
                                {ajustarPosiciones(habitacionesPiso).map((habitacion) => (
                                    <div
                                        key={habitacion.id}
                                        style={{
                                            position: 'absolute',
                                            top: habitacion.posicion_y * 40,
                                            left: habitacion.posicion_x * 40,
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#4CAF50',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '5px',
                                            border: '1px solid #333',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                        }}
                                        title={`Habitación ${habitacion.numero} - Capacidad: ${habitacion.capacidad}`}
                                    >
                                        {habitacion.numero}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default MapaHabitacion;
