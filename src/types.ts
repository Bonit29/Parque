export type UserRole = 'ADMIN' | 'OPERATOR' | 'CLIENT';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  createdAt: string;
  password?: string;
  verificado?: boolean;
  codigo_verificacion?: string;
}

export interface Vehiculo {
  id: string;
  usuarioId: string;
  placa: string;
  tipo: 'auto' | 'moto' | 'discapacitados';
  marca?: string;
  color?: string;
}

export interface Parqueadero {
  id: string;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  capacidadTotal: number;
  tarifaHora: number; // en COP, ej: 5000
  horarioApertura: string; // ej: "06:00"
  horarioCierre: string; // ej: "22:00"
}

export interface Espacio {
  id: string;
  parqueaderoId: string;
  codigoEspacio: string; // ej: "A-01"
  estado: 'disponible' | 'ocupado' | 'reservado' | 'mantenimiento';
  tipo: 'auto' | 'moto' | 'discapacitados';
}

export interface Reserva {
  id: string;
  usuarioId: string;
  usuarioNombre?: string;
  espacioId: string;
  codigoEspacio?: string;
  parqueaderoId: string;
  parqueaderoNombre?: string;
  placaVehiculo: string;
  tipoVehiculo: 'auto' | 'moto' | 'discapacitados';
  fechaReserva: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFin: string; // HH:MM
  entradaReal?: string; // ISO string when check-in occurs
  salidaReal?: string; // ISO string when check-out occurs
  estado: 'pendiente' | 'activa' | 'completada' | 'cancelada';
  montoEstimado: number;
}

export interface Pago {
  id: string;
  reservaId: string;
  usuarioId: string;
  usuarioNombre?: string;
  parqueaderoNombre?: string;
  placaVehiculo: string;
  monto: number;
  metodoPago: 'tarjeta' | 'efectivo' | 'transferencia';
  estadoPago: 'pendiente' | 'aprobado' | 'rechazado';
  transaccionId?: string;
  fecha: string;
}

export interface Calificacion {
  id: string;
  parqueaderoId: string;
  usuarioNombre: string;
  estrellas: number; // 1 to 5
  comentario: string;
  fecha: string;
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

export interface Incidente {
  id: string;
  usuarioNombre: string;
  usuarioRol: 'CLIENT' | 'OPERATOR';
  asunto: string;
  descripcion: string;
  estado: 'pendiente' | 'solucionado';
  fecha: string;
  respuesta?: string;
  sedeNombre?: string;
}

export interface DashboardStats {
  ocupacionActual: number; // porcentaje
  ingresosHoy: number;
  ingresosMes: number;
  reservasActivas: number;
  espaciosLibres: number;
  espaciosMantenimiento: number;
  distribucionOcupacion: { name: string; value: number }[];
  ingresosPorSede: { name: string; value: number }[];
}
