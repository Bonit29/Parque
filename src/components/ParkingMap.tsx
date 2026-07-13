import React from "react";
import { motion } from "motion/react";
import { Espacio } from "../types";
import { CarFront, Bike, ShieldAlert, CheckCircle, Info, Construction } from "lucide-react";

interface ParkingMapProps {
  spaces: Espacio[];
  selectedSpaceId: string | null;
  onSelectSpace: (space: Espacio) => void;
  userRole: 'CLIENT' | 'OPERATOR' | 'ADMIN';
  activeFilter: 'todos' | 'auto' | 'moto' | 'discapacitados';
}

export default function ParkingMap({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  userRole,
  activeFilter
}: ParkingMapProps) {
  
  // Filter spaces based on type
  const filteredSpaces = spaces.filter(s => {
    if (activeFilter === 'todos') return true;
    return s.tipo === activeFilter;
  });

  // Group spaces by type for structured bento zones
  const autos = filteredSpaces.filter(s => s.tipo === 'auto');
  const motos = filteredSpaces.filter(s => s.tipo === 'moto');
  const disabled = filteredSpaces.filter(s => s.tipo === 'discapacitados');

  const countByState = (state: string) => spaces.filter(s => s.estado === state).length;

  const renderSpaceCard = (space: Espacio) => {
    const isSelected = selectedSpaceId === space.id;
    
    // Aesthetic states
    let stateStyles = "";
    let icon = <CarFront className="w-5 h-5" />;
    
    if (space.tipo === 'moto') {
      icon = <Bike className="w-5 h-5" />;
    } else if (space.tipo === 'discapacitados') {
      icon = (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 7h-4v3h3c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2h-5c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2h1V8h-2c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4z"/>
        </svg>
      );
    }

    switch (space.estado) {
      case "disponible":
        stateStyles = "border-emerald-800/40 bg-[#08180f]/30 text-emerald-400 hover:border-emerald-500 hover:bg-[#0c2416]/40 cursor-pointer";
        break;
      case "ocupado":
        stateStyles = "border-stone-800/80 bg-[#16120e] text-stone-500 cursor-not-allowed";
        if (userRole !== 'CLIENT') stateStyles += " hover:bg-[#201a14] cursor-pointer hover:border-stone-700"; // Operators can check out
        break;
      case "reservado":
        stateStyles = "border-teal-700/80 bg-[#061e1b] text-teal-400 cursor-not-allowed";
        if (userRole !== 'CLIENT') stateStyles += " hover:bg-[#0a2e29] cursor-pointer hover:border-teal-600"; // Operators can check in
        break;
      case "mantenimiento":
        stateStyles = "border-stone-800 bg-stone-900/40 text-stone-600 cursor-not-allowed border-dashed";
        if (userRole === 'ADMIN') stateStyles += " hover:bg-stone-800/60 cursor-pointer"; // Admins can release from maintenance
        break;
    }

    if (isSelected) {
      stateStyles = "border-emerald-400 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer scale-[1.03]";
    }

    return (
      <motion.div
        key={space.id}
        layoutId={`space-${space.id}`}
        whileHover={{ y: space.estado === 'disponible' || userRole !== 'CLIENT' ? -2 : 0 }}
        onClick={() => {
          if (space.estado === 'disponible' || userRole !== 'CLIENT') {
            onSelectSpace(space);
          }
        }}
        className={`h-20 rounded-xl border p-2.5 flex flex-col justify-between transition-all duration-300 ${stateStyles}`}
      >
        <div className="flex justify-between items-center w-full">
          <span className="text-xs font-mono font-medium tracking-wider bg-[#050505]/40 px-1.5 py-0.5 rounded border border-neutral-800/30">
            {space.codigoEspacio}
          </span>
          <div className="opacity-80">{icon}</div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] uppercase tracking-widest font-mono font-semibold">
            {space.estado}
          </span>
          {space.estado === "mantenimiento" && (
            <Construction className="w-3.5 h-3.5 animate-pulse text-amber-500/80" />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Real-time Counts Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0a0a0a] border border-neutral-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="text-2xl font-display font-bold text-emerald-400 font-mono">
              {countByState("disponible")}
            </div>
            <div className="text-[11px] text-neutral-400 uppercase tracking-widest">Disponibles</div>
          </div>
        </div>
        
        <div className="bg-[#0a0a0a] border border-neutral-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div>
            <div className="text-2xl font-display font-bold text-rose-400 font-mono">
              {countByState("ocupado")}
            </div>
            <div className="text-[11px] text-neutral-400 uppercase tracking-widest">Ocupados</div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div>
            <div className="text-2xl font-display font-bold text-amber-400 font-mono">
              {countByState("reservado")}
            </div>
            <div className="text-[11px] text-neutral-400 uppercase tracking-widest">Reservados</div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-neutral-600 rounded-full" />
          <div>
            <div className="text-2xl font-display font-bold text-neutral-400 font-mono">
              {countByState("mantenimiento")}
            </div>
            <div className="text-[11px] text-neutral-400 uppercase tracking-widest">Mantenimiento</div>
          </div>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="space-y-6">
        {/* Autos Zone */}
        {autos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-2">
              <CarFront className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-display font-semibold tracking-wide text-neutral-200">
                Zona de Automóviles (Autos)
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {autos.map(renderSpaceCard)}
            </div>
          </div>
        )}

        {/* Motos Zone */}
        {motos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-2">
              <Bike className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-display font-semibold tracking-wide text-neutral-200">
                Zona de Motocicletas (Motos)
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {motos.map(renderSpaceCard)}
            </div>
          </div>
        )}

        {/* Preferential Zone */}
        {disabled.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-2">
              <svg className="w-4 h-4 text-teal-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 7h-4v3h3c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2-1.1 0-2-.9-2-2/v-6h-2c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4z"/>
              </svg>
              <h3 className="text-sm font-display font-semibold tracking-wide text-neutral-200">
                Zona de Preferencial / Discapacitados
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {disabled.map(renderSpaceCard)}
            </div>
          </div>
        )}

        {filteredSpaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500 border border-emerald-900/20 border-dashed rounded-2xl bg-[#07130a]/50">
            <Info className="w-8 h-8 mb-2 text-neutral-600" />
            <p className="text-sm">No se encontraron espacios de parqueo para este filtro.</p>
          </div>
        )}
      </div>

      {/* Map Guidelines Panel */}
      <div className="bg-[#061209]/40 border border-emerald-900/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-300">Monitoreo Inteligente y Sincronización en Tiempo Real</p>
          <p>
            {userRole === 'CLIENT' 
              ? "Seleccione un espacio disponible (verde) para iniciar una reserva de 3 pasos."
              : "Operador/Administrador: Haga clic en cualquier espacio para registrar entradas (check-in), liberar bahías, o alternar estados de mantenimiento."}
          </p>
        </div>
      </div>
    </div>
  );
}
