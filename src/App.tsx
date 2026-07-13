import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Usuario,
  Vehiculo,
  Parqueadero,
  Espacio,
  Reserva,
  Pago,
  Calificacion,
  Notificacion,
  Incidente,
  DashboardStats
} from "./types";
import ParkingMap from "./components/ParkingMap";
import DashboardStatsPanel from "./components/DashboardStatsPanel";
import PlateScanner from "./components/PlateScanner";
import {
  CarFront,
  Bike,
  User,
  ShieldCheck,
  Building,
  DollarSign,
  Star,
  Bell,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Check,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Layers,
  MapPin,
  AlertTriangle,
  LogOut,
  Sparkles,
  Award,
  HelpCircle,
  Cpu,
  Lock,
  Mail,
  Phone,
  ArrowLeft,
  KeyRound,
  Printer,
  Download
} from "lucide-react";

// Predefined accounts for swift testing in AI Studio demo environment
const DEMO_ACCOUNTS = [
  { label: "Cliente", email: "juan@correo.com", rol: "CLIENT" },
  { label: "Operador", email: "carlos@parqueadero.com", rol: "OPERATOR" },
  { label: "Administrador", email: "admin@parqueadero.com", rol: "ADMIN" }
];

export default function App() {
  // System general state
  const [activeRole, setActiveRole] = useState<'CLIENT' | 'OPERATOR' | 'ADMIN'>('CLIENT');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [sedes, setSedes] = useState<Parqueadero[]>([]);
  const [selectedSedeId, setSelectedSedeId] = useState<string>("");
  const [spaces, setSpaces] = useState<Espacio[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Espacio | null>(null);
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [userBookings, setUserBookings] = useState<Reserva[]>([]);
  const [userPayments, setUserPayments] = useState<Pago[]>([]);
  const [userNotifications, setUserNotifications] = useState<Notificacion[]>([]);
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  
  // Forms & UI control
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'todos' | 'auto' | 'moto' | 'discapacitados'>('todos');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'error' | 'info' }[]>([]);
  
  // Steppers (Booking 3-Steps Flow)
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | null>(null);
  const [bookingHours, setBookingHours] = useState({ start: "08:00", end: "10:00" });

  const [showGuideModal, setShowGuideModal] = useState(false);

  // Add Sede Modal State
  const [showAddSedeModal, setShowAddSedeModal] = useState(false);
  const [newSedeForm, setNewSedeForm] = useState({
    nombre: "",
    direccion: "",
    capacidadTotal: "24",
    tarifaHora: "5000",
    horarioApertura: "06:00",
    horarioCierre: "23:59"
  });

  // Check-out Operator Modal
  const [activeCheckoutBooking, setActiveCheckoutBooking] = useState<Reserva | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'tarjeta' | 'efectivo' | 'transferencia'>('efectivo');

  // Add Vehicle form state
  const [newVehicle, setNewVehicle] = useState({ placa: "", tipo: "auto", marca: "", color: "" });

  // Review Sede state
  const [ratingSede, setRatingSede] = useState({ estrellas: 5, comentario: "" });

  // Operator manual drop-in form state
  const [operatorDropIn, setOperatorDropIn] = useState({ placa: "", tipo: "auto" });

  // --- AUTHENTICATION & REGISTRATION STATES ---
  const [authView, setAuthView] = useState<'LOGIN' | 'SIGNUP' | 'VERIFICATION' | 'RECOVER' | 'RESETSUBMIT'>('LOGIN');
  const [simulatedCode, setSimulatedCode] = useState<string>("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupForm, setSignupForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: ""
  });
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");

  // --- ADMIN EMPLOYEE MANAGEMENT STATES ---
  const [allUsers, setAllUsers] = useState<Usuario[]>([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    rol: 'OPERATOR' as 'OPERATOR' | 'ADMIN'
  });

  // --- STATE EXTENSIONS FOR FULL CAPABILITIES ---
  const [currentAdminTab, setCurrentAdminTab] = useState<'indicadores' | 'bahias' | 'usuarios' | 'dispositivos' | 'incidentes'>('indicadores');
  const [currentOperatorTab, setCurrentOperatorTab] = useState<'monitoreo' | 'salida' | 'barrera' | 'incidentes'>('monitoreo');
  const [currentClientTab, setCurrentClientTab] = useState<'reservas' | 'vehiculos' | 'historico' | 'incidentes'>('reservas');
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [respuestaIncidente, setRespuestaIncidente] = useState("");
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<Usuario | null>(null);
  const [barreraAbierta, setBarreraAbierta] = useState(false);
  const [showAddSpaceForm, setShowAddSpaceForm] = useState(false);
  const [newSpaceForm, setNewSpaceForm] = useState({ codigoEspacio: "", tipo: "auto" as "auto" | "moto" | "discapacitados" });
  const [sedeForm, setSedeForm] = useState({
    nombre: "",
    direccion: "",
    tarifaHora: 0,
    horarioApertura: "",
    horarioCierre: ""
  });
  const [globalNotificationForm, setGlobalNotificationForm] = useState({ titulo: "", mensaje: "" });
  const [selectedPagoForReceipt, setSelectedPagoForReceipt] = useState<Pago | null>(null);
  const [selectedUserFilter, setSelectedUserFilter] = useState<'todos' | 'ADMIN' | 'OPERATOR' | 'CLIENT'>('todos');

  // Custom toast notification trigger
  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // --- API CALLING HANDLERS ---
  
  // Login handler with automated password input for testing shortcuts
  const handleDemoLogin = async (email: string) => {
    const password = email.toLowerCase() === "moriix" || email.toLowerCase() === "moriix@parqueadero.com" ? "Moriix1996" : "123456";
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setActiveRole(data.user.rol);
        triggerToast(`¡Bienvenido de nuevo, ${data.user.nombre}!`, 'success');
        
        // Load role specific state
        fetchInitialData(data.user);
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error de conexión con el servidor", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      triggerToast("Por favor ingrese correo/usuario y contraseña", 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setActiveRole(data.user.rol);
        triggerToast(`¡Bienvenido de nuevo, ${data.user.nombre}!`, 'success');
        fetchInitialData(data.user);
        setLoginEmail("");
        setLoginPassword("");
      } else if (res.status === 403 && data.requiresVerification) {
        setVerificationEmail(data.email);
        setAuthView('VERIFICATION');
        setSimulatedCode("");
        triggerToast(data.error, 'info');
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error de conexión al iniciar sesión", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.nombre || !signupForm.email || !signupForm.password) {
      triggerToast("Por favor llene todos los campos obligatorios", 'error');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      triggerToast("Las contraseñas ingresadas no coinciden", 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: signupForm.nombre,
          email: signupForm.email,
          telefono: signupForm.telefono,
          password: signupForm.password,
          rol: "CLIENT"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationEmail(signupForm.email);
        if (data.code) {
          setSimulatedCode(data.code);
        }
        setAuthView('VERIFICATION');
        triggerToast("Registro exitoso. Verifique su cuenta.", 'success');
        setSignupForm({ nombre: "", email: "", telefono: "", password: "", confirmPassword: "" });
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error en el registro de usuario", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      triggerToast("Por favor ingrese el código de verificación", 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, code: verificationCode })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("¡Cuenta verificada con éxito! Ya puede iniciar sesión.", 'success');
        setVerificationCode("");
        setSimulatedCode("");
        setAuthView('LOGIN');
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error de conexión al verificar código", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!verificationEmail) return;
    try {
      setLoading(true);
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.code) {
          setSimulatedCode(data.code);
        }
        triggerToast("Nuevo código de verificación generado.", 'success');
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al reenviar código", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      triggerToast("Por favor ingrese su correo electrónico", 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.code) {
          setSimulatedCode(data.code);
        }
        setAuthView('RESETSUBMIT');
        triggerToast("Código de recuperación generado.", 'success');
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al procesar recuperación", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode || !recoveryNewPassword) {
      triggerToast("Por favor llene todos los campos", 'error');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      triggerToast("Las contraseñas no coinciden", 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoveryEmail,
          code: recoveryCode,
          newPassword: recoveryNewPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("¡Contraseña restablecida correctamente!", 'success');
        setRecoveryEmail("");
        setRecoveryCode("");
        setRecoveryNewPassword("");
        setRecoveryConfirmPassword("");
        setSimulatedCode("");
        setAuthView('LOGIN');
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al restablecer contraseña", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.nombre || !employeeForm.email || !employeeForm.password) {
      triggerToast("Todos los campos obligatorios deben ser completados", 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: employeeForm.nombre,
          email: employeeForm.email,
          telefono: employeeForm.telefono,
          password: employeeForm.password,
          rol: employeeForm.rol,
          createdByAdmin: true
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`Empleado ${employeeForm.nombre} registrado exitosamente como ${employeeForm.rol}.`, 'success');
        setEmployeeForm({ nombre: "", email: "", telefono: "", password: "", rol: 'OPERATOR' });
        setShowEmployeeForm(false);
        fetchUsers();
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al registrar empleado", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setVehicles([]);
    setUserBookings([]);
    setUserPayments([]);
    setUserNotifications([]);
    setSimulatedCode("");
    setAuthView('LOGIN');
    triggerToast("Sesión cerrada correctamente", 'info');
  };

  // Fetch initial setup data
  const fetchSedes = async () => {
    try {
      const res = await fetch("/api/parqueaderos");
      const data = await res.json();
      setSedes(data);
      if (data.length > 0 && !selectedSedeId) {
        setSelectedSedeId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching sedes:", err);
    }
  };

  const fetchSpaces = async (sedeId: string) => {
    if (!sedeId) return;
    try {
      const res = await fetch(`/api/espacios/${sedeId}`);
      const data = await res.json();
      setSpaces(data);
    } catch (err) {
      console.error("Error fetching spaces:", err);
    }
  };

  const fetchInitialData = async (user: Usuario) => {
    if (!user) return;
    try {
      // Fetch user's registered vehicles
      const resV = await fetch(`/api/vehiculos/${user.id}`);
      const dataV = await resV.json();
      setVehicles(dataV);

      // Fetch bookings & payments
      if (user.rol === 'CLIENT') {
        const resB = await fetch(`/api/reservas/${user.id}`);
        const dataB = await resB.json();
        setUserBookings(dataB);

        const resP = await fetch(`/api/pagos/${user.id}`);
        const dataP = await resP.json();
        setUserPayments(dataP);

        const resN = await fetch(`/api/notificaciones/${user.id}`);
        const dataN = await resN.json();
        setUserNotifications(dataN);
      } else if (user.rol === 'ADMIN') {
        fetchAdminStats();
        fetchUsers();
      }
      
      // Load incidentes for all roles
      fetchIncidentes();
    } catch (err) {
      console.error("Error loading profile state", err);
    }
  };

  const fetchIncidentes = async () => {
    try {
      const res = await fetch("/api/incidentes");
      const data = await res.json();
      setIncidentes(data);
    } catch (err) {
      console.error("Error loading incidentes list", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/usuarios");
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error("Error loading users list", err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setAdminStats(data);
    } catch (err) {
      console.error("Error loading stats", err);
    }
  };

  // Reload spaces on Sede selection change
  useEffect(() => {
    fetchSedes();
    fetchIncidentes();
  }, []);

  useEffect(() => {
    if (selectedSedeId) {
      fetchSpaces(selectedSedeId);
      setSelectedSpace(null);
      const activeSede = sedes.find(s => s.id === selectedSedeId);
      if (activeSede) {
        setSedeForm({
          nombre: activeSede.nombre,
          direccion: activeSede.direccion || "",
          tarifaHora: activeSede.tarifaHora || 0,
          horarioApertura: activeSede.horarioApertura || "06:00",
          horarioCierre: activeSede.horarioCierre || "22:00"
        });
      }
    }
  }, [selectedSedeId, sedes]);

  // Synchronize backend modifications via Server-Sent Events (SSE)
  useEffect(() => {
    const sse = new EventSource("/api/realtime");
    
    sse.addEventListener("space_updated", (event: any) => {
      const data = JSON.parse(event.data);
      // If we are looking at this Sede, update the spaces array immediately!
      if (data.parqueaderoId === selectedSedeId) {
        setSpaces(prev => prev.map(s => 
          s.id === data.espacioId ? { ...s, estado: data.nuevo_estado } : s
        ));
      }
      // If admin, update stats
      if (currentUser?.rol === 'ADMIN') {
        fetchAdminStats();
      }
    });

    sse.addEventListener("parqueaderos_updated", (event: any) => {
      const data = JSON.parse(event.data);
      setSedes(data);
    });

    sse.addEventListener("reservas_updated", (event: any) => {
      // Refresh current client/operator booking list
      if (currentUser) {
        fetchInitialData(currentUser);
      }
    });

    sse.addEventListener("pagos_updated", (event: any) => {
      if (currentUser) {
        fetchInitialData(currentUser);
      }
    });

    return () => {
      sse.close();
    };
  }, [selectedSedeId, currentUser]);

  // --- FRONTEND ACTIONS INTERFACES ---

  // Add vehicle action
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newVehicle.placa) return;

    try {
      setLoading(true);
      const res = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: currentUser.id,
          placa: newVehicle.placa,
          tipo: newVehicle.tipo,
          marca: newVehicle.marca,
          color: newVehicle.color
        })
      });
      const data = await res.json();
      if (res.ok) {
        setVehicles(prev => [...prev, data]);
        setNewVehicle({ placa: "", tipo: "auto", marca: "", color: "" });
        triggerToast("¡Vehículo registrado exitosamente!", 'success');
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al registrar vehículo", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Remove vehicle action
  const handleDeleteVehicle = async (id: string) => {
    try {
      const res = await fetch(`/api/vehiculos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVehicles(prev => prev.filter(v => v.id !== id));
        triggerToast("Vehículo removido del perfil", 'info');
      }
    } catch (err) {
      triggerToast("Error al eliminar", 'error');
    }
  };

  // --- COMPREHENSIVE ACTIONS AND SERVICES HANDLERS ---

  // Edit User Handler
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/usuarios/${selectedUserForEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: selectedUserForEdit.nombre,
          email: selectedUserForEdit.email,
          telefono: selectedUserForEdit.telefono,
          rol: selectedUserForEdit.rol,
          verificado: selectedUserForEdit.verificado
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("¡Usuario actualizado correctamente!", 'success');
        setSelectedUserForEdit(null);
        fetchUsers();
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al actualizar usuario", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este usuario de forma permanente? Esta acción no se puede deshacer.")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Usuario eliminado del sistema", 'info');
        fetchUsers();
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al eliminar usuario", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create Space/Slot Handler
  const handleCreateSpaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSedeId || !newSpaceForm.codigoEspacio) return;
    try {
      setLoading(true);
      const res = await fetch("/api/espacios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parqueaderoId: selectedSedeId,
          codigoEspacio: newSpaceForm.codigoEspacio,
          tipo: newSpaceForm.tipo
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`Bahía ${newSpaceForm.codigoEspacio} creada con éxito`, 'success');
        setNewSpaceForm({ codigoEspacio: "", tipo: "auto" });
        setShowAddSpaceForm(false);
        fetchSpaces(selectedSedeId);
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al crear bahía", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Space/Slot Handler
  const handleDeleteSpace = async (id: string) => {
    if (!window.confirm("¿Desea retirar esta bahía de parqueo de la sede?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/espacios/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Bahía eliminada del plano", 'info');
        fetchSpaces(selectedSedeId);
      } else {
        triggerToast("Error al eliminar espacio", 'error');
      }
    } catch (err) {
      triggerToast("Error al conectar con el servidor", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update Sede configurations (Admin)
  const handleUpdateSedeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSedeId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/parqueaderos/${selectedSedeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sedeForm)
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("¡Sede configurada exitosamente!", 'success');
        fetchSedes();
      } else {
        triggerToast(data.error || "Error al actualizar sede", 'error');
      }
    } catch (err) {
      triggerToast("Error de conexión al guardar cambios", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Report Incident Handler
  const handleReportIncidenteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjectInput = (e.target as any).elements.asunto.value;
    const descInput = (e.target as any).elements.descripcion.value;
    const locationInput = (e.target as any).elements.sedeNombre?.value || "";

    if (!subjectInput || !descInput) {
      triggerToast("Por favor complete los campos obligatorios", 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/incidentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioNombre: currentUser?.nombre || "Usuario Invitado",
          usuarioRol: currentUser?.rol || "CLIENT",
          asunto: subjectInput,
          descripcion: descInput,
          sedeNombre: locationInput || sedes.find(s => s.id === selectedSedeId)?.nombre
        })
      });
      if (res.ok) {
        triggerToast("Incidente reportado al Administrador", 'success');
        (e.target as HTMLFormElement).reset();
        fetchIncidentes();
      } else {
        triggerToast("Error al registrar incidente", 'error');
      }
    } catch (err) {
      triggerToast("Error al conectar con servidor", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Answer Incident Handler
  const handleRespondIncidenteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidente) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/incidentes/${selectedIncidente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "solucionado",
          respuesta: respuestaIncidente
        })
      });
      if (res.ok) {
        triggerToast("Incidente solucionado y archivado", 'success');
        setSelectedIncidente(null);
        setRespuestaIncidente("");
        fetchIncidentes();
      } else {
        triggerToast("Error al actualizar incidente", 'error');
      }
    } catch (err) {
      triggerToast("Error al conectar con servidor", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Broadcaster Global Warning Alerta Handler
  const handleBroadcastNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalNotificationForm.titulo || !globalNotificationForm.mensaje) {
      triggerToast("Asunto y cuerpo del mensaje son requeridos", 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/notificaciones/difundir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalNotificationForm)
      });
      if (res.ok) {
        triggerToast("¡Difusión global enviada con éxito!", 'success');
        setGlobalNotificationForm({ titulo: "", mensaje: "" });
        if (currentUser) fetchInitialData(currentUser);
      } else {
        triggerToast("Error al difundir alerta", 'error');
      }
    } catch (err) {
      triggerToast("Error al procesar difusión", 'error');
    } finally {
      setLoading(false);
    }
  };

  // System Database Backup Snapshot
  const handleBackupSystem = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.snapshot, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", data.filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        triggerToast("Copia de seguridad descargada exitosamente", 'success');
      }
    } catch (err) {
      triggerToast("Fallo al generar copia de seguridad", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Restore/Factory reset System Handler
  const handleRestoreSystem = async (customSnapshot?: any) => {
    const confirmation = window.confirm(
      customSnapshot 
        ? "¿Seguro que desea restaurar el sistema al snapshot seleccionado?" 
        : "¿Seguro que desea reiniciar todos los datos a los valores de fábrica de Smart Parking? Se perderán las modificaciones actuales."
    );
    if (!confirmation) return;

    try {
      setLoading(true);
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: customSnapshot || null })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(data.message, 'success');
        fetchSedes();
        fetchIncidentes();
        if (currentUser) fetchInitialData(currentUser);
      }
    } catch (err) {
      triggerToast("Fallo en la restauración", 'error');
    } finally {
      setLoading(false);
    }
  };

  // IoT Gate Control Simulation Handler
  const toggleIoTGate = async (openState: boolean) => {
    try {
      setLoading(true);
      setBarreraAbierta(openState);
      triggerToast(
        openState 
          ? "¡Barrera IoT ABIERTA de emergencia! Sensor infrarrojo activo." 
          : "Barrera IoT CERRADA. Asegurando el paso de acceso.",
        openState ? 'success' : 'info'
      );
    } catch (err) {
      triggerToast("Error en la conexión serial de la barrera", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch or generate receipt visual invoice ticket (Emission)
  const handleShowReceiptForBooking = async (b: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/pagos");
      const pagosList = await res.json();
      const foundPago = pagosList.find((p: any) => p.reservaId === b.id);
      if (foundPago) {
        setSelectedPagoForReceipt(foundPago);
      } else {
        // Fallback mock payment for view demonstration
        const mockPago: Pago = {
          id: `pay_temp_${Math.floor(Math.random() * 9000 + 1000)}`,
          reservaId: b.id,
          usuarioId: b.usuarioId || "u_externo",
          usuarioNombre: b.usuarioNombre || "Cliente General",
          parqueaderoNombre: b.parqueaderoNombre || "Sede Principal",
          placaVehiculo: b.placaVehiculo,
          monto: b.montoEstimado || 8000,
          metodoPago: "efectivo",
          estadoPago: "aprobado",
          transaccionId: `txn_${Math.floor(10000 + Math.random() * 90000)}`,
          fecha: b.salidaReal || new Date().toISOString()
        };
        setSelectedPagoForReceipt(mockPago);
      }
    } catch (err) {
      triggerToast("Fallo al consultar recibo", "error");
    } finally {
      setLoading(false);
    }
  };

  // Complete booking 3-steps
  const handleConfirmReservation = async () => {
    if (!currentUser || !selectedVehicle || !selectedSpace || !selectedSedeId) return;

    try {
      setLoading(true);
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: currentUser.id,
          espacioId: selectedSpace.id,
          placaVehiculo: selectedVehicle.placa,
          tipoVehiculo: selectedVehicle.tipo,
          fechaReserva: new Date().toISOString().split("T")[0],
          horaInicio: bookingHours.start,
          horaFin: bookingHours.end
        })
      });

      const data = await res.json();
      if (res.ok) {
        triggerToast("¡Reserva confirmada en tiempo real!", 'success');
        // Reset booking form
        setBookingStep(1);
        setSelectedVehicle(null);
        setSelectedSpace(null);
        // Refresh spaces
        fetchSpaces(selectedSedeId);
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error al realizar reserva", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Client check-in active reservation
  const handleBookingCheckIn = async (reservaId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reservas/${reservaId}/checkin`, { method: "POST" });
      if (res.ok) {
        triggerToast("¡Check-In completado! Disfrute su estancia.", 'success');
        if (currentUser) fetchInitialData(currentUser);
      }
    } catch (err) {
      triggerToast("Error de red en Check-in", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel reservation
  const handleCancelBooking = async (reservaId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reservas/${reservaId}/cancelar`, { method: "POST" });
      if (res.ok) {
        triggerToast("Reserva cancelada y espacio liberado.", 'info');
        if (currentUser) fetchInitialData(currentUser);
      }
    } catch (err) {
      triggerToast("Error al cancelar reserva", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sede rate update (ADMIN)
  const handleUpdateSedeRates = async (sedeId: string, value: number) => {
    try {
      const res = await fetch(`/api/parqueaderos/${sedeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tarifaHora: value })
      });
      if (res.ok) {
        triggerToast("Tarifa de sede actualizada correctamente.", 'success');
        fetchSedes();
      }
    } catch (err) {
      triggerToast("Error al actualizar tarifas", 'error');
    }
  };

  // Space state edit (OPERATOR/ADMIN - e.g. toggling maintenance)
  const handleToggleSpaceMaintenance = async (space: Espacio) => {
    const nextState = space.estado === "mantenimiento" ? "disponible" : "mantenimiento";
    try {
      const res = await fetch(`/api/espacios/${space.id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nextState })
      });
      if (res.ok) {
        triggerToast(`Espacio ${space.codigoEspacio} puesto en ${nextState}`, 'info');
        fetchSpaces(selectedSedeId);
      }
    } catch (err) {
      triggerToast("Error al alterar estado", 'error');
    }
  };

  // Direct Entry (Drop-in Drop-off) (OPERATOR)
  const handleOperatorDropInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace || !operatorDropIn.placa) {
      triggerToast("Debe seleccionar una bahía disponible y registrar la placa.", 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/reservas/dropin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parqueaderoId: selectedSedeId,
          espacioId: selectedSpace.id,
          placaVehiculo: operatorDropIn.placa,
          tipoVehiculo: operatorDropIn.tipo
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("¡Ingreso directo registrado con éxito!", 'success');
        setSelectedSpace(null);
        setOperatorDropIn({ placa: "", tipo: "auto" });
        fetchSpaces(selectedSedeId);
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (err) {
      triggerToast("Error de red", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Checkout Checkout & payment processor (OPERATOR)
  const handleCheckoutSubmit = async () => {
    if (!activeCheckoutBooking) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/reservas/${activeCheckoutBooking.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPago: checkoutPaymentMethod })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`¡Salida registrada! Recaudo de $${data.pago.monto.toLocaleString()} exitoso.`, 'success');
        setActiveCheckoutBooking(null);
        fetchSpaces(selectedSedeId);
      }
    } catch (err) {
      triggerToast("Error al procesar salida", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add a Sede (ADMIN)
  const handleAddSedeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/parqueaderos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSedeForm)
      });
      if (res.ok) {
        triggerToast("¡Nueva sede comercial creada con éxito!", 'success');
        setShowAddSedeModal(false);
        setNewSedeForm({
          nombre: "",
          direccion: "",
          capacidadTotal: "24",
          tarifaHora: "5000",
          horarioApertura: "06:00",
          horarioCierre: "23:59"
        });
        fetchSedes();
      }
    } catch (err) {
      triggerToast("Error al agregar sede", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Rate Sede Feedback
  const handleRateSedeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch("/api/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parqueaderoId: selectedSedeId,
          usuarioNombre: currentUser.nombre,
          estrellas: ratingSede.estrellas,
          comentario: ratingSede.comentario
        })
      });
      if (res.ok) {
        triggerToast("¡Gracias por calificar nuestro servicio!", 'success');
        setRatingSede({ estrellas: 5, comentario: "" });
      }
    } catch (err) {
      triggerToast("Error al calificar", 'error');
    }
  };

  // Real CSV & Audit report compiler (Daily, Weekly, Monthly)
  const handleExportReportSim = async (reportType: string) => {
    triggerToast(`Compilando reporte ${reportType} de Tránsito y Recaudación...`, 'info');
    
    try {
      setLoading(true);
      // Fetch bookings to compile real statistics
      const resBookings = await fetch("/api/reservas");
      const bookings: Reserva[] = await resBookings.json();
      
      const resPagos = await fetch("/api/pagos");
      const pagos: Pago[] = await resPagos.json();

      const resIncidentes = await fetch("/api/incidentes");
      const incidentes: Incidente[] = await resIncidentes.json();

      setTimeout(() => {
        // Create headers and rows with real data
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `REPORTE DE RENDIMIENTO - TIPO: ${reportType.toUpperCase()} - FECHA DE EMISION: ${new Date().toLocaleDateString()}\n\n`;
        
        // Sección 1: Consolidado de Sede
        csvContent += "CONSOLIDADO GENERAL DE SEDES\n";
        csvContent += "Sede,Capacidad de Bahias,Espacios Libres,Espacios Mantenimiento,Ingresos Totales\n";
        sedes.forEach(s => {
          const sedePagos = pagos.filter(p => p.parqueaderoNombre === s.nombre);
          const totalIngresos = sedePagos.reduce((acc, p) => acc + p.monto, 0);
          const libresCount = adminStats?.espaciosLibres || 12;
          const mantCount = adminStats?.espaciosMantenimiento || 1;
          csvContent += `"${s.nombre}",${s.capacidadTotal},${libresCount},${mantCount},"$${totalIngresos.toLocaleString()}"\n`;
        });

        // Sección 2: Transacciones reales de Pago
        csvContent += "\nHISTORIAL REAL DE PAGOS Y RECAUDO\n";
        csvContent += "ID Transaccion,Fecha,Cliente,Placa,Sede,Monto Pagado,Metodo Pago,Estado\n";
        if (pagos.length === 0) {
          csvContent += "No hay transacciones registradas en este periodo\n";
        } else {
          pagos.forEach(p => {
            csvContent += `"${p.transaccionId}","${new Date(p.fecha).toLocaleDateString()}","${p.usuarioNombre}","${p.placaVehiculo}","${p.parqueaderoNombre}","$${p.monto.toLocaleString()}","${p.metodoPago.toUpperCase()}","${p.estadoPago.toUpperCase()}"\n`;
          });
        }

        // Sección 3: Transito y Reservas
        csvContent += "\nBITACORA DE TRANSITO Y RESERVAS\n";
        csvContent += "ID Reserva,Placa,Bahia,Sede,Inicio,Fin,Estado de Reserva\n";
        if (bookings.length === 0) {
          csvContent += "No hay transacciones de transito registradas\n";
        } else {
          bookings.forEach(b => {
            csvContent += `"${b.id}","${b.placaVehiculo}","${b.codigoEspacio}","${b.parqueaderoNombre}","${b.horaInicio}","${b.horaFin}","${b.estado.toUpperCase()}"\n`;
          });
        }

        // Sección 4: Incidentes
        csvContent += "\nREPORTE DE INCIDENTES Y NOVEDADES\n";
        csvContent += "Asunto,Descripcion,Sede,Reporta,Estado,Respuesta\n";
        if (incidentes.length === 0) {
          csvContent += "No se registran incidentes en el sistema\n";
        } else {
          incidentes.forEach(i => {
            csvContent += `"${i.asunto}","${i.descripcion}","${i.sedeNombre}","${i.usuarioNombre}","${i.estado.toUpperCase()}","${i.respuesta || 'Sin respuesta'}"\n`;
          });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Consolidado_${reportType}_SmartPark_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        triggerToast(`¡Consolidado ${reportType} exportado con éxito!`, 'success');
      }, 1000);

    } catch (err) {
      triggerToast("Error al compilar datos de reporte", "error");
    } finally {
      setLoading(false);
    }
  };

  // Click handler on slot based on Role
  const handleSelectSpaceOnMap = (space: Espacio) => {
    setSelectedSpace(space);
    if (activeRole === 'CLIENT') {
      if (space.estado === 'disponible') {
        setBookingStep(2); // Jump direct to selection confirm step
      }
    } else if (activeRole === 'OPERATOR') {
      if (space.estado === 'ocupado') {
        // Look up who is occupying it
        const occupancyMatch = userBookings.find((r) => r.espacioId === space.id && r.estado === "activa");
        if (occupancyMatch) {
          setActiveCheckoutBooking(occupancyMatch);
        } else {
          // If no booking found, let's create a checkout prompt for a Drop-in vehicle
          const fallbackDropinBooking: Reserva = {
            id: `r_fake_${space.id}`,
            usuarioId: "u_externo",
            usuarioNombre: "Cliente Directo",
            espacioId: space.id,
            codigoEspacio: space.codigoEspacio,
            parqueaderoId: selectedSedeId,
            placaVehiculo: "VEH-999",
            tipoVehiculo: space.tipo,
            fechaReserva: new Date().toISOString().split("T")[0],
            horaInicio: "Hora Entrada",
            horaFin: "Ahora",
            estado: "activa",
            entradaReal: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
            montoEstimado: (sedes.find(s => s.id === selectedSedeId)?.tarifaHora || 5000) * 4
          };
          setActiveCheckoutBooking(fallbackDropinBooking);
        }
      } else if (space.estado === 'reservado') {
        // Operator can check-in this plate directly
        const reservationMatch = userBookings.find((r) => r.espacioId === space.id && r.estado === "pendiente");
        if (reservationMatch) {
          handleBookingCheckIn(reservationMatch.id);
        }
      } else if (space.estado === 'disponible') {
        // Open quick drop-in form focus
        setOperatorDropIn(prev => ({ ...prev, placa: "" }));
      }
    } else if (activeRole === 'ADMIN') {
      handleToggleSpaceMaintenance(space);
    }
  };

  // Scanner callbacks passed to PlateScanner component
  const handleScannerCheckIn = (booking: Reserva) => {
    handleBookingCheckIn(booking.id);
  };

  const handleScannerDropIn = (plate: string, type: 'auto' | 'moto') => {
    setOperatorDropIn({ placa: plate, tipo: type });
    triggerToast(`Placa ${plate} copiada al formulario de registro directo`, 'info');
  };

  // Filtered reservations for admin dashboard search
  const filteredBookingsList = userBookings.filter(b => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return b.placaVehiculo.toLowerCase().includes(query) || 
           b.usuarioNombre?.toLowerCase().includes(query) ||
           b.codigoEspacio?.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-[#050c08] text-neutral-200 flex flex-col font-sans relative overflow-x-hidden grid-dot">
      
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* FIXED TOAST NOTIFICATION LAYER */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-3.5 rounded-xl border shadow-lg flex items-center gap-3 w-80 pointer-events-auto ${
                t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' :
                t.type === 'error' ? 'bg-rose-950/90 border-rose-500/30 text-rose-300' :
                'bg-emerald-900/95 border-emerald-800 text-emerald-300'
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                t.type === 'success' ? 'bg-emerald-400' :
                t.type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'
              }`} />
              <p className="text-xs font-medium">{t.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* TOPBAR HEADER */}
      <header className="sticky top-0 z-40 bg-[#050c08]/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 p-1.5 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CarFront className="w-full h-full text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-md font-display font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
              SmartPark
              <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-medium border border-emerald-800/40 tracking-wider">
                PRO
              </span>
            </h1>
            <span className="text-[10px] text-neutral-400 leading-none">Parqueadero Inteligente IoT</span>
          </div>
          <button
            onClick={() => setShowGuideModal(true)}
            className="ml-3 px-2.5 py-1 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/30 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guía VS Code & XAMPP</span>
          </button>
        </div>

        {/* Dynamic Pre-populated Demo Login Shortcuts */}
        {!currentUser ? (
          <div className="flex items-center gap-2 bg-neutral-900/60 p-1.5 rounded-xl border border-neutral-800/60">
            <span className="text-[10px] text-neutral-400 px-2 font-medium">Demo Acceso Rápido:</span>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.rol}
                onClick={() => handleDemoLogin(acc.email)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-neutral-200 cursor-pointer transition-all active:scale-95"
              >
                {acc.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3.5">
            {/* Active Sede Picker */}
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={selectedSedeId}
                onChange={(e) => setSelectedSedeId(e.target.value)}
                className="bg-[#0a0a0a] border border-neutral-800 rounded-lg text-xs font-medium py-1 px-2.5 text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} (COP {(s.tarifaHora).toLocaleString()}/h)
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Badge */}
            {currentUser.rol === 'CLIENT' && (
              <div className="relative cursor-pointer hover:text-white transition-colors">
                <Bell className="w-4 h-4 text-neutral-400" />
                {userNotifications.some(n => !n.leida) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </div>
            )}

            {/* User identity & profile switch */}
            <div className="flex items-center gap-2 bg-[#0a0a0a]/60 border border-neutral-800 px-2.5 py-1 rounded-xl">
              <div className="w-6.5 h-6.5 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                {currentUser.rol === 'ADMIN' ? (
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                ) : currentUser.rol === 'OPERATOR' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] font-bold text-neutral-200 leading-tight">{currentUser.nombre}</div>
                <div className="text-[9px] text-neutral-500 font-mono tracking-wider uppercase">{currentUser.rol}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1 hover:text-rose-400 text-neutral-500 transition-colors ml-1 cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* INTERACTIVE PLAYGROUND SWITCHER FOR TESTING */}
      {currentUser && (
        <div className="bg-[#0a0a0a]/40 border-b border-neutral-900 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400">Panel De Pruebas De Rol:</span>
          </div>
          <div className="flex bg-[#050505] p-0.5 rounded-lg border border-neutral-800">
            {["CLIENT", "OPERATOR", "ADMIN"].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role as any);
                  triggerToast(`Simulando rol de: ${role}`, 'info');
                }}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeRole === role
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {role === 'CLIENT' ? 'Cliente' : role === 'OPERATOR' ? 'Operador' : 'Administrador'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT CANVAS */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* NO USER VIEW (LOGIN, REGISTER, VERIFICATION & RECOVERY SCREENS) */}
        {!currentUser ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-3.5 flex items-center justify-center shadow-2xl shadow-emerald-500/20 animate-bounce duration-1000">
              <CarFront className="w-full h-full text-black stroke-[2.5]" />
            </div>

            {/* Simulated verification email banner if any is present */}
            {simulatedCode && (
              <div className="w-full p-4 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-left space-y-2.5 animate-pulse">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-emerald-300 font-sans">Simulador de Correo Saliente</span>
                </div>
                <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                  Dado que este es un prototipo local, el sistema simula el envío del correo electrónico. Copie el siguiente código generado:
                </p>
                <div className="bg-[#050505] border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between font-mono text-xs font-bold text-emerald-400">
                  <span>Código de Simulación:</span>
                  <span className="text-sm tracking-widest text-emerald-300 font-black bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60 select-all">{simulatedCode}</span>
                </div>
              </div>
            )}

            {/* VIEW 1: LOGIN PAGE */}
            {authView === 'LOGIN' && (
              <div className="w-full space-y-5 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black tracking-tight text-white leading-tight">
                    SmartPark IoT Pro
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Ingrese a la plataforma para gestionar su estacionamiento en tiempo real o reservar su bahía de parqueo.
                  </p>
                </div>

                <div className="bg-[#0a0a0a]/50 border border-neutral-800 rounded-3xl p-6 w-full space-y-4 shadow-xl text-left">
                  <form onSubmit={handleLoginManual} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Usuario o Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="tu@correo.com o Moriix"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Contraseña</label>
                        <button
                          type="button"
                          onClick={() => { setAuthView('RECOVER'); setSimulatedCode(""); }}
                          className="text-[10px] text-neutral-500 hover:text-emerald-400 underline font-medium cursor-pointer"
                        >
                          ¿Olvidó su contraseña?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer text-center transition-all uppercase tracking-wider mt-1"
                    >
                      {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <span className="text-[11px] text-neutral-500 font-medium">¿No tiene cuenta? </span>
                    <button
                      type="button"
                      onClick={() => { setAuthView('SIGNUP'); setSimulatedCode(""); }}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                    >
                      Regístrese Aquí
                    </button>
                  </div>
                </div>

                {/* Collapsible Demo Shortcut list underneath */}
                <div className="bg-[#0a0a0a]/30 border border-neutral-900 rounded-2xl p-4 w-full space-y-3 shadow-md text-left">
                  <div className="flex items-center gap-1.5 text-neutral-400 border-b border-neutral-900 pb-2">
                    <Cpu className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Atajos de Prueba (AI Studio Demo)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.rol}
                        onClick={() => handleDemoLogin(acc.email)}
                        className="py-2 px-1 rounded-xl bg-[#050505] hover:bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 text-center text-[10px] font-bold text-neutral-300 cursor-pointer active:scale-95 transition-all"
                      >
                        {acc.label}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDemoLogin("Moriix")}
                      className="py-2 px-1 col-span-3 rounded-xl bg-[#0e1610] hover:bg-emerald-950/20 border border-emerald-900/30 hover:border-emerald-800 text-center text-[10px] font-bold text-emerald-400 cursor-pointer active:scale-95 transition-all"
                    >
                      🔑 Administrador Moriix (Moriix1996)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: REGISTRATION (SIGNUP) */}
            {authView === 'SIGNUP' && (
              <div className="w-full space-y-5 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black tracking-tight text-white leading-tight">
                    Crear Cuenta de Socio
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Regístrese en el sistema para consultar disponibilidad, registrar vehículos y reservar bahías de parqueo.
                  </p>
                </div>

                <div className="bg-[#0a0a0a]/50 border border-neutral-800 rounded-3xl p-6 w-full space-y-4 shadow-xl text-left">
                  <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Nombre Completo <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={signupForm.nombre}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, nombre: e.target.value }))}
                          placeholder="Jorman Rodríguez"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Correo Electrónico <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="tu@correo.com"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Teléfono / Celular</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={signupForm.telefono}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, telefono: e.target.value }))}
                          placeholder="320 123 4567"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-medium font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Contraseña <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            value={signupForm.password}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="••••••••"
                            className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Confirmar <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="••••••••"
                            className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer text-center transition-all uppercase tracking-wider mt-1"
                    >
                      {loading ? "Creando Cuenta..." : "Registrarme"}
                    </button>
                  </form>

                  <div className="text-center pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => { setAuthView('LOGIN'); setSimulatedCode(""); }}
                      className="text-[11px] text-neutral-400 hover:text-white font-medium flex items-center gap-1.5 justify-center mx-auto cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Volver al inicio de sesión
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: CODE VERIFICATION */}
            {authView === 'VERIFICATION' && (
              <div className="w-full space-y-5 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black tracking-tight text-white leading-tight">
                    Verifique su Cuenta
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Se ha enviado un código de verificación de 6 dígitos a su correo electrónico: <span className="font-semibold text-emerald-400">{verificationEmail}</span>.
                  </p>
                </div>

                <div className="bg-[#0a0a0a]/50 border border-neutral-800 rounded-3xl p-6 w-full space-y-4 shadow-xl text-left">
                  <form onSubmit={handleVerifyCodeSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block text-center">Código de Verificación (6 Dígitos)</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="123456"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-center font-mono text-sm py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 tracking-[0.4em] font-black"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer text-center transition-all uppercase tracking-wider"
                    >
                      {loading ? "Verificando..." : "Confirmar Código"}
                    </button>
                  </form>

                  <div className="flex flex-col gap-2.5 text-center pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                    >
                      ¿No recibió el código? Reenviar código
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthView('LOGIN'); setSimulatedCode(""); }}
                      className="text-[11px] text-neutral-400 hover:text-white font-medium flex items-center gap-1.5 justify-center mx-auto mt-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Cancelar y Volver
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: PASSWORD RECOVERY */}
            {authView === 'RECOVER' && (
              <div className="w-full space-y-5 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black tracking-tight text-white leading-tight">
                    Recuperar Contraseña
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Ingrese el correo electrónico de su cuenta para enviarle un código de restablecimiento.
                  </p>
                </div>

                <div className="bg-[#0a0a0a]/50 border border-neutral-800 rounded-3xl p-6 w-full space-y-4 shadow-xl text-left">
                  <form onSubmit={handleRecoverPasswordSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Correo Electrónico Registrado</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer text-center transition-all uppercase tracking-wider"
                    >
                      {loading ? "Procesando..." : "Enviar Código de Recuperación"}
                    </button>
                  </form>

                  <div className="text-center pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => { setAuthView('LOGIN'); setSimulatedCode(""); }}
                      className="text-[11px] text-neutral-400 hover:text-white font-medium flex items-center gap-1.5 justify-center mx-auto cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Volver al inicio de sesión
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 5: RESET PASSWORD FORM */}
            {authView === 'RESETSUBMIT' && (
              <div className="w-full space-y-5 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black tracking-tight text-white leading-tight">
                    Restablecer Contraseña
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Ingrese el código enviado y configure su nueva contraseña de acceso.
                  </p>
                </div>

                <div className="bg-[#0a0a0a]/50 border border-neutral-800 rounded-3xl p-6 w-full space-y-4 shadow-xl text-left">
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block text-center">Código de Recuperación</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="123456"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-center font-mono text-sm py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 tracking-[0.4em] font-black"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Nueva Contraseña</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={recoveryNewPassword}
                          onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Confirmar Nueva Contraseña</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={recoveryConfirmPassword}
                          onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-9 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer text-center transition-all uppercase tracking-wider"
                    >
                      {loading ? "Restableciendo..." : "Guardar Nueva Contraseña"}
                    </button>
                  </form>

                  <div className="text-center pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => { setAuthView('LOGIN'); setSimulatedCode(""); }}
                      className="text-[11px] text-neutral-400 hover:text-white font-medium flex items-center gap-1.5 justify-center mx-auto cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Cancelar y Volver
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          
          /* ACTIVE USER WORKSPACE */
          <div className="space-y-6">
            
            {/* 1. ROLE-BASED CONDITIONAL VIEWS */}
            
            {/* === ROLE: CLIENTE / USER VIEW === */}
            {activeRole === 'CLIENT' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Columns: Interactive Booking Flow and map */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Stepper container */}
                  <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-5">
                    
                    {/* Stepper titles */}
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-display font-semibold text-neutral-100">
                          Reservar Espacio en 3 Pasos
                        </h2>
                      </div>
                      
                      {/* Badge steps indicators */}
                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                        <span className={`px-2 py-0.5 rounded ${bookingStep >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-neutral-800 text-neutral-500'}`}>1</span>
                        <span className="text-neutral-700">•</span>
                        <span className={`px-2 py-0.5 rounded ${bookingStep >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-neutral-800 text-neutral-500'}`}>2</span>
                        <span className="text-neutral-700">•</span>
                        <span className={`px-2 py-0.5 rounded ${bookingStep >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-neutral-800 text-neutral-500'}`}>3</span>
                      </div>
                    </div>

                    {/* STEP 1: Select vehicle */}
                    {bookingStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs text-neutral-400">Paso 1: Seleccione cuál vehículo ingresará</label>
                          <p className="text-[11px] text-neutral-500">¿No está registrado? Agregue uno abajo en el panel de vehículos.</p>
                        </div>
                        
                        {vehicles.length === 0 ? (
                          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                            No tiene vehículos registrados en su perfil. Registre su placa en el panel inferior primero para poder reservar.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {vehicles.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => {
                                  setSelectedVehicle(v);
                                  setFilterType(v.tipo); // Automatically pre-filter visual map by vehicle type!
                                  setBookingStep(2);
                                }}
                                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                  selectedVehicle?.id === v.id
                                    ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                                    : "border-neutral-800 bg-[#050505]/40 hover:border-neutral-700"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-[#050505] border border-neutral-800 flex items-center justify-center text-neutral-400">
                                    {v.tipo === 'moto' ? <Bike className="w-4 h-4" /> : <CarFront className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold font-mono tracking-wider text-neutral-200">{v.placa}</div>
                                    <div className="text-[10px] text-neutral-400 capitalize">{v.marca || "Vehículo sin marca"}</div>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-neutral-500" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 2: Choose Slot on Map */}
                    {bookingStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <label className="text-xs text-neutral-400 block">Paso 2: Seleccione una bahía en el mapa</label>
                            <p className="text-[10px] text-neutral-500">Filtrando automáticamente por bahías de tipo: <span className="font-semibold text-emerald-400 capitalize">{selectedVehicle?.tipo}</span></p>
                          </div>
                          <button
                            onClick={() => setBookingStep(1)}
                            className="text-[10px] text-neutral-400 hover:text-white underline"
                          >
                            Atrás
                          </button>
                        </div>

                        {selectedSpace ? (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-medium">Bahía seleccionada con éxito: <span className="font-mono text-emerald-400 font-black">{selectedSpace.codigoEspacio}</span></span>
                            </div>
                            <button
                              onClick={() => setBookingStep(3)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Siguiente Paso
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-[#050505]/40 border border-neutral-800 rounded-xl text-center text-[11px] text-amber-400 font-medium">
                            Haga clic en un espacio disponible (verde) del mapa de abajo para seleccionarlo.
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 3: Timing details and confirmation */}
                    {bookingStep === 3 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-neutral-400">Paso 3: Detalles de Horario y Confirmación</label>
                          <button
                            onClick={() => setBookingStep(2)}
                            className="text-[10px] text-neutral-400 hover:text-white underline"
                          >
                            Atrás
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-400">Hora Entrada</span>
                            <input
                              type="time"
                              value={bookingHours.start}
                              onChange={(e) => setBookingHours(prev => ({ ...prev, start: e.target.value }))}
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-neutral-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-400">Hora Salida Estimada</span>
                            <input
                              type="time"
                              value={bookingHours.end}
                              onChange={(e) => setBookingHours(prev => ({ ...prev, end: e.target.value }))}
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-neutral-200"
                            />
                          </div>
                        </div>

                        {/* Financial summary */}
                        <div className="bg-[#050505] border border-neutral-800 p-3.5 rounded-xl space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-400">Tarifa por Hora:</span>
                            <span className="font-medium text-neutral-200">COP {sedes.find(s => s.id === selectedSedeId)?.tarifaHora.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-400">Espacio Seleccionado:</span>
                            <span className="font-mono text-emerald-400 font-semibold">{selectedSpace?.codigoEspacio}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-400">Vehículo:</span>
                            <span className="font-mono text-neutral-300">{selectedVehicle?.placa}</span>
                          </div>
                          <hr className="border-neutral-800" />
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-neutral-300">Total Estimado:</span>
                            <span className="text-emerald-400">
                              COP {((parseInt(bookingHours.end.split(":")[0]) - parseInt(bookingHours.start.split(":")[0])) * (sedes.find(s => s.id === selectedSedeId)?.tarifaHora || 5000)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleConfirmReservation}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer"
                        >
                          Confirmar y Reservar Bahía
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Visual Map rendering */}
                  <div className="bg-[#0a0a0a]/20 border border-neutral-800/60 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center border-b border-neutral-800/60 pb-3">
                      <h2 className="text-sm font-display font-semibold text-neutral-100 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        Mapa de Disponibilidad
                      </h2>
                      {/* Filter category selector */}
                      <div className="flex bg-[#050505] p-0.5 rounded-lg border border-neutral-800">
                        {['todos', 'auto', 'moto', 'discapacitados'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setFilterType(type as any)}
                            className={`px-2.5 py-1 rounded text-[10px] capitalize transition-all cursor-pointer ${
                              filterType === type ? 'bg-neutral-800 text-emerald-400 font-semibold' : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            {type === 'todos' ? 'Todos' : type}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <ParkingMap
                      spaces={spaces}
                      selectedSpaceId={selectedSpace?.id || null}
                      onSelectSpace={handleSelectSpaceOnMap}
                      userRole="CLIENT"
                      activeFilter={filterType}
                    />
                  </div>
                </div>

                {/* Right Column: Vehicles, Reviews, Bookings log, Payments history */}
                <div className="space-y-6">
                  
                  {/* Vehicles block */}
                  <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2">
                      Mis Vehículos Registrados
                    </h3>
                    
                    {/* Add vehicle form */}
                    <form onSubmit={handleAddVehicle} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Placa (ABC-123)"
                        value={newVehicle.placa}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, placa: e.target.value }))}
                        className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 text-neutral-200 col-span-2 uppercase font-mono font-bold tracking-wider"
                        required
                      />
                      <select
                        value={newVehicle.tipo}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, tipo: e.target.value }))}
                        className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2 text-neutral-300 cursor-pointer"
                      >
                        <option value="auto">Automóvil</option>
                        <option value="moto">Motocicleta</option>
                        <option value="discapacitados">Preferencial</option>
                      </select>
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar
                      </button>
                    </form>

                    {/* Vehicles List */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {vehicles.map((v) => (
                        <div key={v.id} className="p-2.5 bg-[#050505]/60 border border-neutral-800/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {v.tipo === 'moto' ? <Bike className="w-4 h-4 text-emerald-400" /> : <CarFront className="w-4 h-4 text-emerald-400" />}
                            <span className="text-xs font-mono font-bold tracking-wide text-neutral-200">{v.placa}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteVehicle(v.id)}
                            className="p-1 hover:text-rose-400 text-neutral-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Bookings Log */}
                  <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                      Mis Reservas / Tránsito Activo
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {userBookings.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No tiene reservas realizadas hoy.</p>
                      ) : (
                        userBookings.map((b) => (
                          <div key={b.id} className="p-3 bg-[#050505]/60 border border-neutral-800 rounded-xl space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded inline-block font-mono font-semibold uppercase tracking-wider mb-1.5">
                                  {b.estado}
                                </div>
                                <div className="text-xs font-bold text-neutral-200">{b.parqueaderoNombre}</div>
                              </div>
                              <span className="text-xs font-mono font-black text-emerald-300 bg-[#0a0a0a] px-2 py-0.5 rounded border border-neutral-800">
                                {b.codigoEspacio}
                              </span>
                            </div>

                            <div className="text-[10px] text-neutral-400 space-y-0.5">
                              <div>Placa: <span className="font-mono text-neutral-200 font-semibold">{b.placaVehiculo}</span></div>
                              <div>Horario: <span className="text-neutral-200">{b.horaInicio} - {b.horaFin}</span></div>
                            </div>

                            <div className="flex gap-2 pt-1.5">
                              {b.estado === 'pendiente' && (
                                <>
                                  <button
                                    onClick={() => handleBookingCheckIn(b.id)}
                                    className="flex-1 py-1 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-lg hover:bg-emerald-400 cursor-pointer"
                                  >
                                    Check-In
                                  </button>
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="flex-1 py-1 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 text-[10px] font-bold rounded-lg cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                              {b.estado === 'activa' && (
                                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/30 border border-emerald-500/20 px-2 py-1 rounded-lg w-full justify-center">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Vehículo en bahía</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2">
                      Calificar Sede Comercial
                    </h3>
                    <form onSubmit={handleRateSedeSubmit} className="space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingSede(prev => ({ ...prev, estrellas: star }))}
                            className="p-0.5 cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${star <= ratingSede.estrellas ? "text-amber-400 fill-amber-400" : "text-neutral-700"}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Escriba sus comentarios sobre la sede, seguridad o espacios..."
                        value={ratingSede.comentario}
                        onChange={(e) => setRatingSede(prev => ({ ...prev, comentario: e.target.value }))}
                        className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 text-neutral-200 w-full h-16 resize-none focus:outline-none focus:border-neutral-700"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Enviar Calificación
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* === ROLE: OPERADOR / OPERATOR VIEW === */}
            {activeRole === 'OPERATOR' && (
              <div className="space-y-6">
                
                {/* Embedded Gemini vision plate OCR scanner */}
                <PlateScanner
                  reservas={userBookings}
                  onCheckInPlate={handleScannerCheckIn}
                  onDropInPlate={handleScannerDropIn}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Visual Map and legend */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4 shadow-xl">
                      <h2 className="text-sm font-display font-semibold text-neutral-100 border-b border-neutral-800/60 pb-3">
                        Monitoreo de Bahías en Sede (Operaciones)
                      </h2>
                      <ParkingMap
                        spaces={spaces}
                        selectedSpaceId={selectedSpace?.id || null}
                        onSelectSpace={handleSelectSpaceOnMap}
                        userRole="OPERATOR"
                        activeFilter="todos"
                      />
                    </div>
                  </div>

                  {/* Manual Drop-In & Active Lot vehicles */}
                  <div className="space-y-6">
                    
                    {/* Direct entry form */}
                    <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2">
                        Ingreso Directo (Sin Reserva)
                      </h3>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Seleccione una bahía libre en el mapa, complete la placa e ingrese el vehículo.
                      </p>
                      
                      <form onSubmit={handleOperatorDropInSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-500">Bahía Seleccionada</span>
                          <div className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 font-mono font-bold text-emerald-400">
                            {selectedSpace ? selectedSpace.codigoEspacio : "Ninguna - Seleccione del mapa"}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-500">Placa del Vehículo</span>
                          <input
                            type="text"
                            placeholder="ABC-123"
                            value={operatorDropIn.placa}
                            onChange={(e) => setOperatorDropIn(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                            className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 text-neutral-200 w-full uppercase font-mono font-bold"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-500">Tipo</span>
                          <select
                            value={operatorDropIn.tipo}
                            onChange={(e) => setOperatorDropIn(prev => ({ ...prev, tipo: e.target.value as any }))}
                            className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2 w-full text-neutral-300"
                          >
                            <option value="auto">Automóvil</option>
                            <option value="moto">Motocicleta</option>
                            <option value="discapacitados">Preferencial</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={!selectedSpace}
                          className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            selectedSpace 
                              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" 
                              : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
                          }`}
                        >
                          Registrar Ingreso de Vehículo
                        </button>
                      </form>
                    </div>

                    {/* Active Transit Cars list in the Sede */}
                    <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2">
                        Vehículos en Bahías Hoy
                      </h3>
                      <div className="space-y-2.5 max-h-64 overflow-y-auto">
                        {userBookings.filter(r => r.estado === "activa").length === 0 ? (
                          <p className="text-xs text-neutral-500 text-center py-4">No hay vehículos ocupando bahías.</p>
                        ) : (
                          userBookings.filter(r => r.estado === "activa").map((b) => (
                            <div key={b.id} className="p-3 bg-[#050505]/60 border border-neutral-800 rounded-xl flex justify-between items-center">
                              <div>
                                <span className="text-xs font-mono font-black text-neutral-100 bg-[#0a0a0a] px-2 py-0.5 rounded border border-neutral-800 mr-2">
                                  {b.codigoEspacio}
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-400">{b.placaVehiculo}</span>
                                <div className="text-[10px] text-neutral-400 mt-1">Ingreso: {b.entradaReal ? new Date(b.entradaReal).toLocaleTimeString() : b.horaInicio}</div>
                              </div>
                              <button
                                onClick={() => setActiveCheckoutBooking(b)}
                                className="px-2 py-1 bg-rose-500 hover:bg-rose-400 text-slate-950 text-[10px] font-bold rounded-md cursor-pointer"
                              >
                                Registrar Salida
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === ROLE: ADMINISTRADOR / ADMIN VIEW === */}
            {activeRole === 'ADMIN' && (
              <div className="space-y-6">
                
                {/* Tabs de Navegación del Administrador */}
                <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
                  {[
                    { id: 'indicadores', label: 'Indicadores e Informes', icon: Layers },
                    { id: 'bahias', label: 'Mantenimiento de Bahías', icon: Building },
                    { id: 'usuarios', label: 'Control de Usuarios', icon: User },
                    { id: 'dispositivos', label: 'IoT y Dispositivos', icon: Cpu },
                    { id: 'incidentes', label: 'Incidentes y Difusión', icon: AlertTriangle }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setCurrentAdminTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          currentAdminTab === tab.id
                            ? 'bg-emerald-500 text-slate-950 shadow-lg font-bold'
                            : 'bg-[#0a0a0a]/50 text-neutral-400 hover:text-neutral-200 border border-neutral-800/60'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* CONTENIDO DE PESTAÑA: INDICADORES E INFORMES */}
                {currentAdminTab === 'indicadores' && (
                  <div className="space-y-6">
                    {/* Metric dashboard panel */}
                    {adminStats && (
                      <DashboardStatsPanel
                        stats={adminStats}
                        sedes={sedes}
                        pagos={userPayments}
                        onExportReport={handleExportReportSim}
                      />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Generador de Informes Periódicos */}
                      <div className="lg:col-span-2 bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                        <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2">
                          Generador de Informes Financieros y de Tránsito
                        </h3>
                        <p className="text-xs text-neutral-400">
                          Seleccione el periodo y el tipo de reporte que desea compilar. El sistema generará y descargará el informe consolidado.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <div className="p-4 bg-[#050505]/60 border border-neutral-800 rounded-xl space-y-2.5 text-center">
                            <h4 className="text-xs font-bold text-neutral-200">Informe Diario</h4>
                            <p className="text-[10px] text-neutral-500">Corte de caja de las últimas 24 horas.</p>
                            <button 
                              onClick={() => {
                                handleExportReportSim("Diario");
                                triggerToast("Generando Reporte Diario...", "info");
                              }}
                              className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Descargar Diario
                            </button>
                          </div>
                          <div className="p-4 bg-[#050505]/60 border border-neutral-800 rounded-xl space-y-2.5 text-center">
                            <h4 className="text-xs font-bold text-neutral-200">Informe Semanal</h4>
                            <p className="text-[10px] text-neutral-500">Consolidado de tránsitos de los últimos 7 días.</p>
                            <button 
                              onClick={() => {
                                handleExportReportSim("Semanal");
                                triggerToast("Generando Reporte Semanal...", "info");
                              }}
                              className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Descargar Semanal
                            </button>
                          </div>
                          <div className="p-4 bg-[#050505]/60 border border-neutral-800 rounded-xl space-y-2.5 text-center">
                            <h4 className="text-xs font-bold text-neutral-200">Informe Mensual</h4>
                            <p className="text-[10px] text-neutral-500">Balance de ocupación, tarifas y recaudación.</p>
                            <button 
                              onClick={() => {
                                handleExportReportSim("Mensual");
                                triggerToast("Generando Reporte Mensual...", "info");
                              }}
                              className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Descargar Mensual
                            </button>
                          </div>
                        </div>

                        {/* Copias de seguridad y restauración del sistema */}
                        <div className="pt-4 border-t border-neutral-800/60 space-y-3">
                          <h4 className="text-xs font-bold text-neutral-300">Respaldo y Copias de Seguridad del Sistema</h4>
                          <div className="flex flex-col sm:flex-row gap-3.5">
                            <button
                              onClick={handleBackupSystem}
                              className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                            >
                              <RefreshCw className="w-4 h-4 animate-spin-slow" />
                              Respaldar Base de Datos (JSON)
                            </button>
                            <button
                              onClick={() => handleRestoreSystem()}
                              className="flex-1 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Restaurar Datos Semilla
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Sedes & Rates Configuration */}
                      <div className="space-y-6">
                        <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                            <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400">
                              Sedes y Tarifas por Hora
                            </h3>
                            <button
                              onClick={() => setShowAddSedeModal(true)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-lg hover:bg-emerald-400 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Agregar
                            </button>
                          </div>

                          <div className="space-y-3">
                            {sedes.map((s) => (
                              <div key={s.id} className="p-3.5 bg-[#050505]/60 border border-neutral-800 rounded-xl space-y-2.5">
                                <div>
                                  <h4 className="text-xs font-bold text-neutral-200">{s.nombre}</h4>
                                  <p className="text-[10px] text-neutral-500 mt-0.5">{s.direccion}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400 font-mono bg-[#0a0a0a]/40 p-2 rounded-lg border border-neutral-800/50">
                                  <div>Bahías: <span className="text-neutral-200 font-bold">{s.capacidadTotal}</span></div>
                                  <div>Horas: <span className="text-neutral-200 font-bold">{s.horarioApertura}-{s.horarioCierre}</span></div>
                                </div>

                                <div className="flex items-center justify-between gap-2.5 pt-1">
                                  <span className="text-[10px] text-neutral-400 font-medium">Tarifa por Hora:</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-emerald-400 font-bold font-mono">$</span>
                                    <input
                                      type="number"
                                      value={s.tarifaHora}
                                      onChange={(e) => handleUpdateSedeRates(s.id, parseInt(e.target.value) || 0)}
                                      className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1 px-2 w-20 text-neutral-200 font-mono text-right focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Opinions list */}
                        <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2">
                            Opiniones Recientes
                          </h3>
                          <div className="space-y-2.5 max-h-48 overflow-y-auto">
                            <div className="p-3 bg-[#050505]/60 border border-neutral-800 rounded-xl space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-neutral-200">Juan Pérez</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((st) => (
                                    <Star key={st} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-[10px] text-neutral-400 leading-relaxed">Excelente ubicación, las bahías son amplias y de fácil acceso.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENIDO DE PESTAÑA: MANTENIMIENTO DE BAHÍAS */}
                {currentAdminTab === 'bahias' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Interactive Layout Map */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b border-neutral-800/60 pb-3">
                          <h2 className="text-sm font-display font-semibold text-neutral-100 flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-emerald-400" />
                            Distribución de Bahías de Parqueo (Layout)
                          </h2>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                            Modo Mantenimiento Directo
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          Haga clic en cualquier bahía para cambiar alternativamente su estado a <strong>Mantenimiento</strong> o <strong>Disponible</strong> de manera inmediata.
                        </p>
                        
                        <ParkingMap
                          spaces={spaces}
                          selectedSpaceId={null}
                          onSelectSpace={handleSelectSpaceOnMap}
                          userRole="ADMIN"
                          activeFilter="todos"
                        />
                      </div>

                      {/* General list with search filter */}
                      <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400">
                            Bitácora General de Tránsito y Reservas
                          </h3>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Buscar placa..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1 px-8 w-44 focus:outline-none focus:border-neutral-700"
                            />
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-neutral-300">
                            <thead className="bg-[#050505]/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
                              <tr>
                                <th className="p-3">Sede</th>
                                <th className="p-3">Usuario</th>
                                <th className="p-3">Placa / Bahía</th>
                                <th className="p-3">Horario</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3">Monto</th>
                                <th className="p-3 text-center">Comprobante</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60 font-medium">
                              {filteredBookingsList.map((b) => (
                                <tr key={b.id} className="hover:bg-[#0a0a0a]/40 transition-colors">
                                  <td className="p-3 font-sans font-medium">{b.parqueaderoNombre}</td>
                                  <td className="p-3 text-neutral-300">{b.usuarioNombre}</td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono bg-[#050505] px-1.5 py-0.5 rounded border border-neutral-800 font-bold text-neutral-200">{b.placaVehiculo}</span>
                                      <span className="text-emerald-400 font-bold font-mono">[{b.codigoEspacio}]</span>
                                    </div>
                                  </td>
                                  <td className="p-3 font-mono text-neutral-400">{b.horaInicio} - {b.horaFin}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                      b.estado === 'completada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      b.estado === 'cancelada' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                      b.estado === 'activa' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                      {b.estado}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono text-emerald-400">${b.montoEstimado.toLocaleString()}</td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleShowReceiptForBooking(b)}
                                      className="px-2.5 py-1 bg-[#050505] hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold rounded-lg border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all active:scale-95"
                                    >
                                      Ver Ticket
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Space Slot Creator and Manager */}
                    <div className="space-y-6">
                      {/* Formulario de Configuración de Horarios y Tarifas */}
                      <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="border-b border-neutral-800 pb-2">
                          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400">
                            Configuración de Sede y Tarifas
                          </h3>
                          <p className="text-[10px] text-neutral-500 mt-0.5">Defina tarifas y horarios de funcionamiento de la sede seleccionada.</p>
                        </div>
                        <form onSubmit={handleUpdateSedeSubmit} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Nombre de la Sede</label>
                            <input
                              type="text"
                              value={sedeForm.nombre}
                              onChange={(e) => setSedeForm(prev => ({ ...prev, nombre: e.target.value }))}
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none focus:border-emerald-500"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Tarifa por Hora ($ CO)</label>
                            <input
                              type="number"
                              value={sedeForm.tarifaHora}
                              onChange={(e) => setSedeForm(prev => ({ ...prev, tarifaHora: parseFloat(e.target.value) || 0 }))}
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Apertura (HH:MM)</label>
                              <input
                                type="text"
                                value={sedeForm.horarioApertura}
                                onChange={(e) => setSedeForm(prev => ({ ...prev, horarioApertura: e.target.value }))}
                                placeholder="06:00"
                                className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Cierre (HH:MM)</label>
                              <input
                                type="text"
                                value={sedeForm.horarioCierre}
                                onChange={(e) => setSedeForm(prev => ({ ...prev, horarioCierre: e.target.value }))}
                                placeholder="22:00"
                                className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Dirección</label>
                            <input
                              type="text"
                              value={sedeForm.direccion}
                              onChange={(e) => setSedeForm(prev => ({ ...prev, direccion: e.target.value }))}
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none focus:border-emerald-500"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2 bg-[#0a0a0a] border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase font-semibold mt-1"
                          >
                            Guardar Cambios de Sede
                          </button>
                        </form>
                      </div>

                      <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400">
                            Agregar Nueva Bahía
                          </h3>
                          <button
                            onClick={() => setShowAddSpaceForm(!showAddSpaceForm)}
                            className="text-[10px] bg-neutral-800 px-2 py-1 rounded text-neutral-300 hover:text-neutral-100"
                          >
                            {showAddSpaceForm ? "Cancelar" : "Crear Bahía"}
                          </button>
                        </div>

                        {showAddSpaceForm && (
                          <form onSubmit={handleCreateSpaceSubmit} className="space-y-3 p-3 bg-[#050505] border border-neutral-800 rounded-xl">
                            <div className="space-y-1">
                              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Código de Espacio *</label>
                              <input
                                type="text"
                                value={newSpaceForm.codigoEspacio}
                                onChange={(e) => setNewSpaceForm(prev => ({ ...prev, codigoEspacio: e.target.value }))}
                                placeholder="D-4"
                                className="bg-[#0a0a0a] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Tipo de Vehículo *</label>
                              <select
                                value={newSpaceForm.tipo}
                                onChange={(e) => setNewSpaceForm(prev => ({ ...prev, tipo: e.target.value as any }))}
                                className="bg-[#0a0a0a] border border-neutral-800 rounded-lg text-xs py-1.5 px-1.5 w-full text-neutral-300"
                              >
                                <option value="auto">Automóvil</option>
                                <option value="moto">Motocicleta</option>
                                <option value="discapacitados">Discapacitados / Preferencial</option>
                              </select>
                            </div>
                            <button
                              type="submit"
                              className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold rounded hover:bg-emerald-400 cursor-pointer uppercase font-semibold"
                            >
                              Agregar Bahía de Parqueo
                            </button>
                          </form>
                        )}

                        <div className="space-y-2.5 max-h-96 overflow-y-auto">
                          <p className="text-[10px] text-neutral-500">Bahías registradas en esta sede: <strong>{spaces.length} bahías</strong></p>
                          <div className="grid grid-cols-2 gap-2">
                            {spaces.map((space) => (
                              <div key={space.id} className="p-2 bg-[#050505]/60 border border-neutral-800 rounded-lg flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-mono font-bold text-neutral-200">{space.codigoEspacio}</span>
                                  <div className="text-[9px] text-neutral-500 uppercase">{space.tipo}</div>
                                </div>
                                <button
                                  onClick={() => handleDeleteSpace(space.id)}
                                  className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                                  title="Eliminar Bahía"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENIDO DE PESTAÑA: CONTROL DE USUARIOS */}
                {currentAdminTab === 'usuarios' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Users list with Search and Filter */}
                    <div className="lg:col-span-2 bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                        <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400">
                          Directorio General de Usuarios Registrados
                        </h3>
                        {/* Search and Role Filter */}
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={selectedUserFilter}
                            onChange={(e) => setSelectedUserFilter(e.target.value as any)}
                            className="bg-[#050505] border border-neutral-800 rounded-lg text-[10px] py-1 px-1.5 text-neutral-400 focus:outline-none"
                          >
                            <option value="todos">Todos los Roles</option>
                            <option value="ADMIN">Administradores</option>
                            <option value="OPERATOR">Operadores</option>
                            <option value="CLIENT">Clientes</option>
                          </select>
                          <div className="relative">
                            <Search className="w-3 h-3 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Buscar..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-[10px] py-1 px-6 w-32 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-120 overflow-y-auto pr-1">
                        {allUsers
                          .filter(u => {
                            if (selectedUserFilter !== 'todos' && u.rol !== selectedUserFilter) return false;
                            if (searchQuery) {
                              const q = searchQuery.toLowerCase();
                              return u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.telefono && u.telefono.includes(q));
                            }
                            return true;
                          })
                          .map((user) => (
                            <div key={user.id} className="p-3.5 bg-[#050505]/60 border border-neutral-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 hover:border-neutral-700 transition-colors">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-neutral-200">{user.nombre}</h4>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold tracking-wider ${
                                    user.rol === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    user.rol === 'OPERATOR' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    'bg-neutral-800 text-neutral-400 border border-neutral-700/50'
                                  }`}>
                                    {user.rol === 'ADMIN' ? 'Admin' : user.rol === 'OPERATOR' ? 'Operador' : 'Cliente'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-neutral-500 mt-0.5">{user.email} • Tel: {user.telefono || "No registrado"}</p>
                                <div className="text-[9px] text-neutral-500 mt-1 font-mono">ID: {user.id} • Creado: {new Date(user.createdAt).toLocaleDateString()}</div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono mr-2 ${
                                  user.verificado ? 'text-emerald-400 bg-emerald-500/5' : 'text-amber-500 bg-amber-500/5'
                                }`}>
                                  {user.verificado ? "✓ Verificado" : "⌛ Pendiente"}
                                </span>
                                <button
                                  onClick={() => setSelectedUserForEdit(user)}
                                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold rounded cursor-pointer transition-all active:scale-95"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1.5 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded cursor-pointer"
                                  disabled={user.id === "u_moriix"} // Protect superadmin
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Right Column: Employee Registration Form */}
                    <div className="space-y-6">
                      <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            Registrar Nuevo Empleado
                          </h3>
                        </div>

                        <form onSubmit={handleRegisterEmployeeSubmit} className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Nombre Completo *</label>
                            <input
                              type="text"
                              value={employeeForm.nombre}
                              onChange={(e) => setEmployeeForm(prev => ({ ...prev, nombre: e.target.value }))}
                              placeholder="Andrés Valenzuela"
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none focus:border-emerald-500"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Correo Electrónico *</label>
                            <input
                              type="email"
                              value={employeeForm.email}
                              onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="andres@parqueadero.com"
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Teléfono / Celular</label>
                            <input
                              type="tel"
                              value={employeeForm.telefono}
                              onChange={(e) => setEmployeeForm(prev => ({ ...prev, telefono: e.target.value }))}
                              placeholder="315 789 1234"
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Contraseña *</label>
                              <input
                                type="password"
                                value={employeeForm.password}
                                onChange={(e) => setEmployeeForm(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••"
                                className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none font-mono"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Rol Autorizado *</label>
                              <select
                                value={employeeForm.rol}
                                onChange={(e) => setEmployeeForm(prev => ({ ...prev, rol: e.target.value as any }))}
                                className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-1.5 w-full text-neutral-300"
                              >
                                <option value="OPERATOR">Operador</option>
                                <option value="ADMIN">Administrador</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                          >
                            {loading ? "Registrando..." : "Crear Cuenta de Empleado"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENIDO DE PESTAÑA: DISPOSITIVOS IOT Y CÁMARAS */}
                {currentAdminTab === 'dispositivos' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                    {/* Left Column: Surveillance Cameras Stream Simulation */}
                    <div className="lg:col-span-2 bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2 flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Monitoreo de Cámaras de Seguridad y Sensores Infrarrojos
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Transmisión de video CCTV simulada en tiempo real para control de accesos y vigilancia interna de las bahías.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Camara 1 */}
                        <div className="bg-[#050505] border border-neutral-800 rounded-xl overflow-hidden relative shadow-md">
                          <div className="h-40 bg-neutral-900 flex items-center justify-center relative">
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest animate-pulse font-bold">
                              ● REC CAM 01
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono">ENTRADA PRINCIPAL - BARRERA IoT</span>
                            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-neutral-400">FPS: 30 • HD</div>
                          </div>
                          <div className="p-2.5 bg-[#0a0a0a] border-t border-neutral-800 flex justify-between items-center text-[10px]">
                            <span className="text-neutral-400 font-medium">Estado del Sensor de Acceso:</span>
                            <span className="text-emerald-400 font-bold font-mono">ACTIVO</span>
                          </div>
                        </div>

                        {/* Camara 2 */}
                        <div className="bg-[#050505] border border-neutral-800 rounded-xl overflow-hidden relative shadow-md">
                          <div className="h-40 bg-neutral-900 flex items-center justify-center relative">
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest animate-pulse font-bold">
                              ● REC CAM 02
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono">BOULEVARD CENTRAL - BAHÍAS SECCIÓN A</span>
                            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-neutral-400">FPS: 28 • HD</div>
                          </div>
                          <div className="p-2.5 bg-[#0a0a0a] border-t border-neutral-800 flex justify-between items-center text-[10px]">
                            <span className="text-neutral-400 font-medium">Estado de Luces Indicadoras:</span>
                            <span className="text-emerald-400 font-bold font-mono">OPTIMO</span>
                          </div>
                        </div>
                      </div>

                      {/* Configuración de Horario de Funcionamiento */}
                      <div className="pt-4 border-t border-neutral-800/60 space-y-3">
                        <h4 className="text-xs font-bold text-neutral-300">Configuración Horaria de Operación</h4>
                        <p className="text-[10px] text-neutral-400">Establezca los horarios en los cuales los usuarios pueden realizar reservas automáticas por medio de la app.</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                            <label className="text-[8px] text-neutral-500 font-mono uppercase tracking-wider font-bold block">Horario de Apertura</label>
                            <input 
                              type="time" 
                              defaultValue="06:00"
                              className="bg-[#0a0a0a] border border-neutral-800 rounded text-xs py-1 px-2 text-slate-200"
                            />
                          </div>
                          <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                            <label className="text-[8px] text-neutral-500 font-mono uppercase tracking-wider font-bold block">Horario de Cierre</label>
                            <input 
                              type="time" 
                              defaultValue="23:59"
                              className="bg-[#0a0a0a] border border-neutral-800 rounded text-xs py-1 px-2 text-slate-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: IoT Gate/Barra de Acceso Controls */}
                    <div className="space-y-6">
                      <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                        <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2">
                          Control de Barrera IoT
                        </h3>
                        <p className="text-[10px] text-neutral-400">
                          Comandos remotos seriales del puente Arduino simulados para abrir o cerrar la talanquera de acceso.
                        </p>

                        <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full ${barreraAbierta ? "bg-emerald-500 animate-ping" : "bg-rose-500 animate-pulse"}`} />
                            <span className="text-xs font-mono font-bold uppercase text-neutral-200">
                              {barreraAbierta ? "Barrera ABIERTA" : "Barrera CERRADA"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              onClick={() => toggleIoTGate(true)}
                              className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all uppercase ${
                                barreraAbierta 
                                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" 
                                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                              }`}
                              disabled={barreraAbierta}
                            >
                              Abrir
                            </button>
                            <button
                              onClick={() => toggleIoTGate(false)}
                              className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all uppercase ${
                                !barreraAbierta 
                                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" 
                                  : "bg-rose-500 text-slate-950 hover:bg-rose-400"
                              }`}
                              disabled={!barreraAbierta}
                            >
                              Cerrar
                            </button>
                          </div>
                        </div>

                        {/* Arduino Log Stream */}
                        <div className="p-3 bg-black rounded-lg border border-neutral-800 font-mono text-[9px] text-emerald-400 space-y-1">
                          <div className="text-neutral-500">--- ARDUINO BRIDGE SERIAL LOGS ---</div>
                          <div>[13:17:15] ARDUINO Connected on /dev/ttyUSB0</div>
                          <div>[13:17:16] MODE: Simulado (Autodetectado)</div>
                          <div>[13:17:22] SENSOR Infrared A-1 triggers STATE: 1</div>
                          {barreraAbierta ? (
                            <div className="text-emerald-300 font-bold animate-pulse">[13:19:04] SERIAL OUT: GATE_OPEN_SUCCESS</div>
                          ) : (
                            <div className="text-rose-300 font-bold">[13:19:08] SERIAL OUT: GATE_CLOSE_SUCCESS</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENIDO DE PESTAÑA: INCIDENTES Y DIFUSIÓN */}
                {currentAdminTab === 'incidentes' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                    {/* Left Column: Incidents/Buzón de quejas */}
                    <div className="lg:col-span-2 bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2">
                        Buzón de Incidentes y Reclamos
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Historial de incidentes y reclamos reportados por operadores o clientes. Haga clic para resolver e ingresar la solución.
                      </p>

                      <div className="space-y-3.5 max-h-120 overflow-y-auto pr-1">
                        {incidentes.length === 0 ? (
                          <p className="text-xs text-neutral-500 text-center py-8">No hay incidentes reportados en el sistema.</p>
                        ) : (
                          incidentes.map((inc) => (
                            <div 
                              key={inc.id} 
                              onClick={() => {
                                if (inc.estado === 'pendiente') {
                                  setSelectedIncidente(inc);
                                  setRespuestaIncidente("");
                                }
                              }}
                              className={`p-4 rounded-xl border transition-all ${
                                inc.estado === 'pendiente' 
                                  ? 'bg-[#050505] border-amber-500/30 hover:border-amber-500/50 cursor-pointer' 
                                  : 'bg-[#050505]/60 border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2.5">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-neutral-200">{inc.asunto}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                                      inc.usuarioRol === 'OPERATOR' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                                    }`}>
                                      {inc.usuarioRol === 'OPERATOR' ? 'Operador' : 'Cliente'}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                                      inc.estado === 'pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                      {inc.estado}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{inc.descripcion}</p>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-3 border-t border-neutral-900 pt-2 font-mono">
                                <div>Por: <span className="text-neutral-300">{inc.usuarioNombre}</span> • Sede: <span className="text-neutral-300">{inc.sedeNombre}</span></div>
                                <div>{new Date(inc.fecha).toLocaleDateString()}</div>
                              </div>

                              {inc.respuesta && (
                                <div className="mt-3 p-2.5 bg-[#0a0a0a]/80 border border-neutral-800/80 rounded-lg text-[11px] space-y-1 text-emerald-400">
                                  <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-500 block">Respuesta de Soporte:</span>
                                  <p className="leading-relaxed">{inc.respuesta}</p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right Column: Global Warning Broadcast */}
                    <div className="space-y-6">
                      <div className="bg-[#0a0a0a]/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                        <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                          <Bell className="w-4 h-4" />
                          Difusión Global de Notificaciones
                        </h3>
                        <p className="text-[10px] text-neutral-400">
                          Envíe una alerta, recordatorio de pago, promoción o alerta vial a todos los clientes y empleados del sistema simultáneamente.
                        </p>

                        <form onSubmit={handleBroadcastNotificationSubmit} className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Título de la Alerta *</label>
                            <input
                              type="text"
                              value={globalNotificationForm.titulo}
                              onChange={(e) => setGlobalNotificationForm(prev => ({ ...prev, titulo: e.target.value }))}
                              placeholder="Feriado o Mantenimiento de Bahías"
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono font-bold block">Mensaje de Difusión *</label>
                            <textarea
                              value={globalNotificationForm.mensaje}
                              onChange={(e) => setGlobalNotificationForm(prev => ({ ...prev, mensaje: e.target.value }))}
                              placeholder="Estimados socios, el día de mañana se realizará la limpieza del asfalto..."
                              rows={4}
                              className="bg-[#050505] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 w-full text-slate-200 focus:outline-none font-sans"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer uppercase tracking-wider"
                          >
                            Difundir Mensaje
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- ADD NEW SEDE MODAL (ADMIN) --- */}
      <AnimatePresence>
        {showAddSedeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSedeModal(false)}
              className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-md font-display font-bold text-neutral-100 border-b border-neutral-800 pb-2">
                Registrar Nueva Sede de Parqueadero
              </h3>
              
              <form onSubmit={handleAddSedeSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Nombre de la Sede</span>
                  <input
                    type="text"
                    value={newSedeForm.nombre}
                    onChange={(e) => setNewSedeForm(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Sede Santa Bárbara"
                    className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-3 w-full text-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Dirección</span>
                  <input
                    type="text"
                    value={newSedeForm.direccion}
                    onChange={(e) => setNewSedeForm(prev => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Avenida Pepe Sierra # 15-32"
                    className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-3 w-full text-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Bahías Totales</span>
                    <input
                      type="number"
                      value={newSedeForm.capacidadTotal}
                      onChange={(e) => setNewSedeForm(prev => ({ ...prev, capacidadTotal: e.target.value }))}
                      className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-3 w-full text-slate-200 font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Tarifa por Hora</span>
                    <input
                      type="number"
                      value={newSedeForm.tarifaHora}
                      onChange={(e) => setNewSedeForm(prev => ({ ...prev, tarifaHora: e.target.value }))}
                      className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-3 w-full text-slate-200 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Apertura</span>
                    <input
                      type="text"
                      value={newSedeForm.horarioApertura}
                      onChange={(e) => setNewSedeForm(prev => ({ ...prev, horarioApertura: e.target.value }))}
                      placeholder="06:00"
                      className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-3 w-full text-slate-200 font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Cierre</span>
                    <input
                      type="text"
                      value={newSedeForm.horarioCierre}
                      onChange={(e) => setNewSedeForm(prev => ({ ...prev, horarioCierre: e.target.value }))}
                      placeholder="23:00"
                      className="bg-[#050505] border border-neutral-800 rounded-xl text-xs py-2 px-3 w-full text-slate-200 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Crear Sede
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSedeModal(false)}
                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- OPERATOR CHECKOUT & CHARGE MODAL --- */}
      <AnimatePresence>
        {activeCheckoutBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCheckoutBooking(null)}
              className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-md font-display font-bold text-neutral-100 border-b border-neutral-800 pb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-400" />
                Registrar Salida y Procesar Cobro
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-[#050505] p-3 rounded-xl border border-neutral-800/80">
                  <div className="text-neutral-400">Placa Vehículo:</div>
                  <div className="font-mono text-neutral-100 font-bold text-right">{activeCheckoutBooking.placaVehiculo}</div>

                  <div className="text-neutral-400">Bahía asignada:</div>
                  <div className="font-mono text-sky-400 font-bold text-right">Espacio {activeCheckoutBooking.codigoEspacio}</div>

                  <div className="text-neutral-400">Socio / Propietario:</div>
                  <div className="text-neutral-100 font-semibold text-right">{activeCheckoutBooking.usuarioNombre}</div>

                  <div className="text-neutral-400">Entrada Registrada:</div>
                  <div className="text-neutral-100 text-right">
                    {activeCheckoutBooking.entradaReal ? new Date(activeCheckoutBooking.entradaReal).toLocaleTimeString() : activeCheckoutBooking.horaInicio}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block">Seleccionar Método de Pago</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['efectivo', 'tarjeta', 'transferencia'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setCheckoutPaymentMethod(method as any)}
                        className={`py-2 rounded-lg border text-[11px] font-bold capitalize transition-all cursor-pointer ${
                          checkoutPaymentMethod === method 
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                            : "border-neutral-800 bg-[#050505] text-neutral-400"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final Totaling Receipt */}
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-neutral-300">Total Recaudar:</span>
                  <span className="text-lg font-display font-black text-emerald-400 font-mono">
                    COP {activeCheckoutBooking.montoEstimado.toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCheckoutSubmit}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl cursor-pointer"
                  >
                    Confirmar Pago y Liberar Bahía
                  </button>
                  <button
                    onClick={() => setActiveCheckoutBooking(null)}
                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Atrás
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* GUIDES AND XAMPP CONNECTOR MANUAL MODAL */}
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuideModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#070f0b] border border-emerald-900/30 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto scrollbar-thin text-left"
            >
              <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-md font-display font-bold text-neutral-100">
                    Guía de Despliegue Local & Conexión XAMPP
                  </h3>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="text-neutral-500 hover:text-neutral-200 text-xs font-bold uppercase cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-6 text-xs text-neutral-300">
                {/* PART 1 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full flex items-center justify-center border border-emerald-800/40">1</span>
                    Guardar y Ejecutar en VS Code en Linux
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                    <li>En la esquina superior derecha de la interfaz de AI Studio, abre el menú de configuración y selecciona <strong>Exportar / Descargar ZIP</strong> para guardar el proyecto completo en tu computador.</li>
                    <li>Extrae el archivo ZIP en una carpeta de tu sistema Linux (por ejemplo, <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-400 font-mono">~/Proyectos/SmartPark</code> o <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-400 font-mono">/home/tu-usuario/SmartPark</code>).</li>
                    <li>Abre <strong>Visual Studio Code</strong> en Linux. Puedes hacerlo desde el menú de aplicaciones o usando la terminal:
                      <pre className="bg-black text-emerald-400 p-2 rounded-lg font-mono text-[10px] mt-1 select-all">code ~/Proyectos/SmartPark</pre>
                    </li>
                    <li>Abre una Terminal integrada en VS Code (menú <strong>Terminal &gt; Nueva Terminal</strong> o usando el atajo <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-[10px]">Ctrl + `</kbd>).</li>
                    <li>Instala las dependencias del proyecto ejecutando el gestor de paquetes de Node.js:
                      <pre className="bg-black text-emerald-400 p-2 rounded-lg font-mono text-[10px] mt-1 select-all">npm install</pre>
                    </li>
                    <li>Inicia el servidor de desarrollo de React ejecutando:
                      <pre className="bg-black text-emerald-400 p-2 rounded-lg font-mono text-[10px] mt-1 select-all">npm run dev</pre>
                    </li>
                    <li>Abre tu navegador (Firefox, Chrome, etc.) e ingresa a la URL <code className="text-emerald-300">http://localhost:3000</code> para interactuar con la aplicación de forma local.</li>
                  </ol>
                </div>

                {/* PART 2 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full flex items-center justify-center border border-emerald-800/40">2</span>
                    Integración con XAMPP / LAMPP en Linux (MySQL)
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Para conectar los datos simulados de este frontend a una base de datos física real (MySQL/MariaDB) servida por XAMPP en Linux, sigue estos pasos:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                    <li>En Linux, XAMPP se instala comúnmente en el directorio <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-400 font-mono">/opt/lampp/</code> (LAMPP).</li>
                    <li>Inicia los servicios de XAMPP (Apache y MySQL) mediante tu terminal con privilegios de superusuario (<code className="font-mono text-emerald-400">sudo</code>):
                      <pre className="bg-black text-emerald-400 p-2 rounded-lg font-mono text-[10px] mt-1 select-all">sudo /opt/lampp/lampp start</pre>
                    </li>
                    <li>Abre tu navegador y visita la consola de administración de base de datos en: <a href="http://localhost/phpmyadmin/" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">http://localhost/phpmyadmin/</a>.</li>
                    <li>Crea una nueva base de datos llamada <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-400 font-mono font-bold">smartpark_db</code>.</li>
                    <li>Haga clic en la pestaña <strong>SQL</strong> de phpMyAdmin, copia el siguiente script estructurado y ejecútalo para crear las tablas correspondientes:</li>
                  </ol>

                  {/* SQL SCRIPTS BOX */}
                  <div className="space-y-1 mt-2">
                    <span className="text-[9px] text-neutral-400 font-mono block uppercase">Script SQL de Creación (Copiar en phpMyAdmin):</span>
                    <pre className="bg-black/90 text-emerald-400 p-3 rounded-xl font-mono text-[9px] overflow-x-auto max-h-48 select-all scrollbar-thin">
{`CREATE DATABASE IF NOT EXISTS smartpark_db;
USE smartpark_db;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('CLIENT', 'OPERATOR', 'ADMIN') DEFAULT 'CLIENT',
    membresia ENUM('estandar', 'premium') DEFAULT 'estandar',
    saldo DECIMAL(10,2) DEFAULT 0.00
);

-- 2. Tabla de Vehiculos
CREATE TABLE IF NOT EXISTS vehiculos (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50),
    placa VARCHAR(10) UNIQUE NOT NULL,
    tipo ENUM('auto', 'moto', 'discapacitados') DEFAULT 'auto',
    marca VARCHAR(50),
    color VARCHAR(30),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 3. Tabla de Sedes (Sedes de Parqueaderos)
CREATE TABLE IF NOT EXISTS sedes (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(150),
    capacidad_total INT DEFAULT 30,
    tarifa_hora DECIMAL(10,2) DEFAULT 5000.00
);

-- 4. Tabla de Espacios (Bahías de Parqueo)
CREATE TABLE IF NOT EXISTS espacios (
    id VARCHAR(50) PRIMARY KEY,
    sede_id VARCHAR(50),
    codigo_espacio VARCHAR(10) NOT NULL,
    tipo ENUM('auto', 'moto', 'discapacitados') DEFAULT 'auto',
    estado ENUM('disponible', 'ocupado', 'reservado', 'mantenimiento') DEFAULT 'disponible',
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE
);

-- 5. Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50),
    usuario_nombre VARCHAR(100),
    sede_id VARCHAR(50),
    codigo_espacio VARCHAR(10),
    placa_vehiculo VARCHAR(10),
    tipo_vehiculo VARCHAR(20),
    hora_inicio VARCHAR(20),
    hora_fin VARCHAR(20),
    monto_estimado DECIMAL(10,2),
    estado ENUM('pendiente', 'activa', 'completada', 'cancelada') DEFAULT 'pendiente',
    entrada_real DATETIME,
    salida_real DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);`}
                    </pre>
                  </div>
                </div>

                {/* PART 3 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full flex items-center justify-center border border-emerald-800/40">3</span>
                    Cómo conectar el Frontend con XAMPP en su Entorno Linux
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Para conectar React a la base de datos de XAMPP/LAMPP, puedes crear una API intermedia en PHP dentro de tu directorio público webroot de Linux:
                  </p>
                  <ol className="list-decimal pl-4 space-y-2 text-[11px] leading-relaxed">
                    <li>Crea la carpeta del proyecto en htdocs y otorga permisos de escritura para que puedas editarla cómodamente:
                      <pre className="bg-black text-emerald-400 p-2 rounded-lg font-mono text-[10px] mt-1 select-all">sudo mkdir -p /opt/lampp/htdocs/smartpark
sudo chmod -R 777 /opt/lampp/htdocs/smartpark</pre>
                    </li>
                    <li>Crea un archivo llamado <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-400 font-mono">api.php</code> y guárdalo en <code className="font-mono text-emerald-300">/opt/lampp/htdocs/smartpark/api.php</code>.</li>
                    <li>Coloca el siguiente código en el archivo para conectar MySQL y responder en formato JSON:
                      <pre className="bg-black text-emerald-400 p-2.5 rounded-lg font-mono text-[9px] mt-1 max-h-40 overflow-y-auto select-all scrollbar-thin">
{`<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$host = "localhost";
$db_name = "smartpark_db";
$username = "root";
$password = ""; // Por defecto vacío en XAMPP

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(["error" => "Conexión fallida: " . $exception->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Ejemplo de endpoint para leer reservas
    $stmt = $conn->prepare("SELECT * FROM reservas");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
}
?>`}
                      </pre>
                    </li>
                    <li>En el archivo React local de tu proyecto, cambia las llamadas <code className="bg-black/40 px-1 py-0.5 text-rose-400 font-mono font-bold">fetch()</code> que apunten a rutas locales por <code className="bg-black/40 px-1 py-0.5 text-emerald-400 font-mono font-bold">fetch("http://localhost/smartpark/api.php")</code>. ¡Listo! Tu aplicación se comunicará directamente con tu servidor local MySQL en Linux.</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-emerald-950">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-lg"
                >
                  Entendido, ¡Listo para exportar!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPROBANTE/RECIBO TÉRMICO INTERACTIVO (EMISIÓN DE COMPROBANTES) */}
      <AnimatePresence>
        {selectedPagoForReceipt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-[#0d0d0d]">
                <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-emerald-400">
                  Comprobante Oficial de Pago
                </h3>
                <button
                  onClick={() => setSelectedPagoForReceipt(null)}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-bold"
                >
                  Cerrar
                </button>
              </div>

              {/* TICKET DE IMPRESIÓN */}
              <div className="p-6 bg-white text-slate-900 font-mono text-xs space-y-4 shadow-inner mx-4 my-5 rounded-lg border border-neutral-200">
                {/* Cabecera del ticket */}
                <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">Smart Parking System</h4>
                  <p className="text-[10px] text-slate-500">Bogotá D.C. - Colombia</p>
                  <p className="text-[9px] text-slate-400">NIT: 901.234.567-8</p>
                  <p className="text-[10px] text-slate-600 font-bold mt-1">{selectedPagoForReceipt.parqueaderoNombre}</p>
                </div>

                {/* Detalles de la Transacción */}
                <div className="space-y-1.5 text-[10px] border-b border-dashed border-slate-300 pb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Factura No:</span>
                    <span className="font-bold text-slate-800">{selectedPagoForReceipt.transaccionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha/Hora:</span>
                    <span className="text-slate-800">{new Date(selectedPagoForReceipt.fecha).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cliente:</span>
                    <span className="font-bold text-slate-800">{selectedPagoForReceipt.usuarioNombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehículo Placa:</span>
                    <span className="font-extrabold text-slate-950 font-sans tracking-wide bg-slate-100 px-1 border border-slate-300 rounded text-xs">{selectedPagoForReceipt.placaVehiculo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Método de Pago:</span>
                    <span className="font-bold uppercase text-slate-800">{selectedPagoForReceipt.metodoPago}</span>
                  </div>
                </div>

                {/* Liquidación */}
                <div className="space-y-1 pb-2">
                  <div className="flex justify-between text-[11px]">
                    <span>Servicio Parqueo Tarifario</span>
                    <span>1.00 ud</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-800 border-t border-slate-200 pt-1.5 text-xs">
                    <span>TOTAL PAGADO:</span>
                    <span className="text-emerald-700 text-sm font-black">${selectedPagoForReceipt.monto.toLocaleString()}</span>
                  </div>
                </div>

                {/* Código QR simulado */}
                <div className="flex flex-col items-center justify-center pt-3 border-t border-dashed border-slate-300 space-y-2">
                  <svg className="w-20 h-20 text-slate-800" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                    <rect x="13" y="13" width="14" height="14" fill="white" />
                    <rect x="15" y="15" width="10" height="10" fill="currentColor" />

                    <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                    <rect x="73" y="13" width="14" height="14" fill="white" />
                    <rect x="75" y="15" width="10" height="10" fill="currentColor" />

                    <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                    <rect x="13" y="73" width="14" height="14" fill="white" />
                    <rect x="15" y="75" width="10" height="10" fill="currentColor" />

                    <rect x="35" y="15" width="5" height="10" fill="currentColor" />
                    <rect x="45" y="10" width="10" height="5" fill="currentColor" />
                    <rect x="40" y="25" width="5" height="5" fill="currentColor" />
                    <rect x="55" y="20" width="10" height="5" fill="currentColor" />
                    
                    <rect x="15" y="35" width="10" height="5" fill="currentColor" />
                    <rect x="10" y="45" width="5" height="10" fill="currentColor" />
                    <rect x="25" y="40" width="5" height="5" fill="currentColor" />

                    <rect x="35" y="35" width="15" height="15" fill="currentColor" />
                    <rect x="38" y="38" width="9" height="9" fill="white" />
                    <rect x="41" y="41" width="3" height="3" fill="currentColor" />

                    <rect x="70" y="35" width="5" height="15" fill="currentColor" />
                    <rect x="80" y="40" width="10" height="5" fill="currentColor" />

                    <rect x="35" y="55" width="10" height="5" fill="currentColor" />
                    <rect x="45" y="60" width="5" height="10" fill="currentColor" />
                    <rect x="55" y="50" width="10" height="15" fill="currentColor" />

                    <rect x="70" y="55" width="15" height="5" fill="currentColor" />
                    <rect x="75" y="65" width="5" height="15" fill="currentColor" />
                    <rect x="85" y="60" width="5" height="5" fill="currentColor" />

                    <rect x="15" y="60" width="5" height="5" fill="currentColor" />
                    <rect x="25" y="55" width="5" height="10" fill="currentColor" />

                    <rect x="35" y="75" width="15" height="5" fill="currentColor" />
                    <rect x="40" y="85" width="10" height="5" fill="currentColor" />
                    <rect x="55" y="75" width="5" height="15" fill="currentColor" />
                  </svg>
                  <p className="text-[8px] text-slate-400 text-center uppercase">Escanee para validar comprobante</p>
                </div>

                <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-3 italic">
                  ¡Gracias por su visita! Smart Parking System.
                </div>
              </div>

              {/* ACCIONES DEL COMPROBANTE */}
              <div className="p-5 border-t border-neutral-800 bg-[#0d0d0d] flex gap-2">
                <button
                  onClick={() => {
                    triggerToast("Enviando comando de impresión a ticketera...", "info");
                    setTimeout(() => triggerToast("¡Ticket impreso correctamente!", "success"), 1500);
                  }}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Ticket
                </button>
                <button
                  onClick={() => {
                    triggerToast("Descargando archivo de comprobante...", "info");
                    setTimeout(() => triggerToast("Comprobante guardado como PDF en Descargas", "success"), 1500);
                  }}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER METADATA */}
      <footer className="mt-auto border-t border-neutral-900 bg-[#050505] text-center py-4 text-[10px] text-neutral-500 font-mono">
        <div>SmartPark • IoT Web Application Workspace • Bogotá Colombia</div>
        <div className="text-neutral-600">Built using modern TypeScript, React, and Google Gemini 3.5 AI</div>
      </footer>
    </div>
  );
}
