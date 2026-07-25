"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

export type Tier = "low" | "high";

/** Nodos de la marca de convergencia, en profundidad 3D real (tetraedro). */
const NODES: Array<[number, number, number]> = [
  [-1.15, 0.38, 0.55],
  [1.22, 0.12, -0.5],
  [0.18, 1.28, 0.15],
  [-0.12, -1.18, -0.6],
];
const NODE_R = [0.46, 0.4, 0.38, 0.44];
const RED = "#E02B20";
const EXPO = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Los cuatro nodos rojos: material cerámico que responde a la luz. */
function Nodes() {
  return (
    <group>
      {NODES.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[NODE_R[i], 48, 48]} />
          <meshPhysicalMaterial
            color={RED}
            roughness={0.28}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.18}
            sheen={0.6}
            sheenColor={"#ff7a6e"}
            emissive={RED}
            emissiveIntensity={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Partículas de tinta (los "muchos miembros") que convergen desde el espacio 3D
 * y se ensamblan sobre los nodos (el "un cuerpo"). Convergencia ~2.5s expo-out.
 */
function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const start = useRef(0);

  const { positions, data } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const data = new Float32Array(count * 7); // sx,sy,sz, tx,ty,tz, delay
    for (let i = 0; i < count; i++) {
      // Origen: disperso en una esfera amplia.
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      const rr = 4.5 + Math.random() * 3.5;
      const sx = Math.sin(b) * Math.cos(a) * rr;
      const sy = Math.sin(b) * Math.sin(a) * rr;
      const sz = Math.cos(b) * rr;
      // Destino: en la superficie de un nodo (mayormente) o el espacio entre ellos.
      const ni = (Math.random() * NODES.length) | 0;
      const [nx, ny, nz] = NODES[ni]!;
      const spread = Math.random() < 0.82 ? NODE_R[ni]! * 1.15 : 1.6;
      const ta = Math.random() * Math.PI * 2;
      const tb = Math.acos(2 * Math.random() - 1);
      const tr = spread * (0.55 + Math.random() * 0.6);
      const tx = nx + Math.sin(tb) * Math.cos(ta) * tr;
      const ty = ny + Math.sin(tb) * Math.sin(ta) * tr;
      const tz = nz + Math.cos(tb) * tr;
      positions[i * 3] = sx;
      positions[i * 3 + 1] = sy;
      positions[i * 3 + 2] = sz;
      data.set([sx, sy, sz, tx, ty, tz, Math.random() * 0.5], i * 7);
    }
    return { positions, data };
  }, [count]);

  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    if (!start.current) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current;
    const DUR = 2.0;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const o = i * 7;
      const pr = Math.max(0, Math.min(1, (t - data[o + 6]!) / DUR));
      const e = EXPO(pr);
      // Respiración orgánica una vez asentado.
      const br = pr >= 1 ? Math.sin(t * 0.8 + i) * 0.02 : 0;
      arr[i * 3] = data[o]! + (data[o + 3]! - data[o]!) * e + br;
      arr[i * 3 + 1] = data[o + 1]! + (data[o + 4]! - data[o + 1]!) * e + br;
      arr[i * 3 + 2] = data[o + 2]! + (data[o + 5]! - data[o + 2]!) * e;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        color={"#2b2622"}
        transparent
        opacity={0.72}
        depthWrite={false}
      />
    </points>
  );
}

/** Grupo con giro majestuoso continuo + parallax de cursor / vaivén autónomo. */
function Rig({ children }: { children: React.ReactNode }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (spin.current) {
      spin.current.rotation.y += delta * 0.12;
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.7) * 0.012; // respira
      spin.current.scale.setScalar(s);
    }
    if (outer.current) {
      const t = state.clock.elapsedTime;
      // Cursor (desktop) + vaivén sutil que da vida también en móvil.
      const tgtY = pointer.x * 0.35 + Math.sin(t * 0.25) * 0.05;
      const tgtX = -pointer.y * 0.28 + Math.cos(t * 0.2) * 0.04;
      tilt.current.y += (tgtY - tilt.current.y) * 0.05;
      tilt.current.x += (tgtX - tilt.current.x) * 0.05;
      outer.current.rotation.y = tilt.current.y;
      outer.current.rotation.x = tilt.current.x;
    }
  });

  return (
    <group ref={outer}>
      <group ref={spin}>{children}</group>
    </group>
  );
}

function Effects({ tier }: { tier: Tier }) {
  return (
    <EffectComposer multisampling={tier === "high" ? 4 : 0}>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      {tier === "high" ? (
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={2.2}
        />
      ) : (
        <></>
      )}
      <Vignette eskil={false} offset={0.32} darkness={0.42} />
    </EffectComposer>
  );
}

export default function HeroCanvas({
  tier,
  paused,
}: {
  tier: Tier;
  paused: boolean;
}) {
  const count = tier === "high" ? 1300 : 440;
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: tier === "high", alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6], fov: 45 }}
    >
      {/* Luz cinematográfica: principal cálida + relleno fría + ambiente. */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 5, 3]} intensity={1.5} color="#ffd9b0" />
      <directionalLight position={[-4, -2, -3]} intensity={0.55} color="#bcd3ff" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#fff2e8" />
      <Rig>
        <Nodes />
        <Particles count={count} />
      </Rig>
      <Effects tier={tier} />
    </Canvas>
  );
}
