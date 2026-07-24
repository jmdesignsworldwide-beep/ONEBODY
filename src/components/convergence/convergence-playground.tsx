"use client";

import { useState } from "react";
import { ConvergenceCanvas } from "./convergence-canvas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Banco de pruebas del sistema de convergencia: progreso simulado 0→100 y
 * pulso de donación en vivo, antes de conectarlo a datos reales (Sección 6).
 */
export function ConvergencePlayground() {
  const [pct, setPct] = useState(35);
  const [pulse, setPulse] = useState(0);

  function donate() {
    setPulse((n) => n + 1);
    setPct((p) => Math.min(100, p + 6));
  }

  const progress = pct / 100;

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col items-center">
        <ConvergenceCanvas variant="hero" progress={progress} pulseSignal={pulse} />
        <p className="tabular mt-2 font-display text-5xl text-ob-bone">{pct}%</p>
      </div>

      {/* Controles */}
      <div className="mx-auto w-full max-w-xl rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-carbon p-6">
        <label
          htmlFor="progress"
          className="mb-3 block text-xs uppercase tracking-[0.2em] text-ob-smoke"
        >
          Progreso simulado
        </label>
        <input
          id="progress"
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="w-full accent-ob-red"
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="donate" size="sm" onClick={donate}>
            Simular donación
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPct(0)}>
            0%
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPct(100)}>
            100%
          </Button>
        </div>
      </div>

      {/* Los otros dos tamaños, compartiendo el mismo progreso y pulso */}
      <div className="flex flex-wrap items-end justify-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <Badge>card</Badge>
          <ConvergenceCanvas variant="card" progress={progress} pulseSignal={pulse} />
        </div>
        <div className="flex flex-col items-center gap-3">
          <Badge>inline</Badge>
          <ConvergenceCanvas
            variant="inline"
            progress={progress}
            pulseSignal={pulse}
          />
        </div>
      </div>
    </div>
  );
}
