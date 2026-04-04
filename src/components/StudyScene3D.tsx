import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const Book = ({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string }) => {
  const ref = useRef<THREE.Group>(null);
  
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={ref} position={position} rotation={rotation}>
        {/* Book cover */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.15, 0.9]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Pages */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.1, 0.12, 0.85]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
        </mesh>
      </group>
    </Float>
  );
};

const Pencil = ({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.4}>
      <group position={position} rotation={rotation}>
        {/* Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.5, 6]} />
          <meshStandardMaterial color="#f5c542" roughness={0.4} />
        </mesh>
        {/* Tip */}
        <mesh position={[0, -0.85, 0]} castShadow>
          <coneGeometry args={[0.05, 0.2, 6]} />
          <meshStandardMaterial color="#d4a84b" roughness={0.3} />
        </mesh>
        {/* Lead */}
        <mesh position={[0, -0.98, 0]}>
          <coneGeometry args={[0.02, 0.08, 6]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    </Float>
  );
};

const GraduationCap = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={ref} position={position}>
        {/* Board */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.06, 1.2]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Cap base */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.3, 4]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
        </mesh>
        {/* Tassel button */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#f5c542" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
};

const Desk = () => {
  return (
    <group position={[0, -1.5, 0]}>
      {/* Desk surface */}
      <mesh receiveShadow>
        <boxGeometry args={[5, 0.15, 3]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  );
};

const Lamp = ({ position }: { position: [number, number, number] }) => {
  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={position}>
        {/* Base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.3, 0.08, 16]} />
          <meshStandardMaterial color="#2d2d3d" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Arm */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
          <meshStandardMaterial color="#3d3d4d" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Shade */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <coneGeometry args={[0.3, 0.35, 16, 1, true]} />
          <meshStandardMaterial color="#6366f1" roughness={0.4} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Bulb light */}
        <pointLight position={[0, 1, 0]} intensity={0.8} color="#ffeaa7" distance={4} />
      </group>
    </Float>
  );
};

const Coffee = ({ position }: { position: [number, number, number] }) => {
  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={position}>
        {/* Cup */}
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.3, 16]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
        {/* Coffee */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.05, 16]} />
          <meshStandardMaterial color="#3e2723" roughness={0.8} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
};

const FloatingAtom = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ref.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.8}>
      <group ref={ref} position={position} scale={0.4}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <MeshDistortMaterial color="#8b5cf6" speed={2} distort={0.2} metalness={0.5} roughness={0.2} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 3, Math.PI / 6]}>
            <torusGeometry args={[0.5, 0.015, 8, 64]} />
            <meshStandardMaterial color="#a78bfa" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

const BackgroundParticles = () => {
  const count = 60;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#8b5cf6" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow color="#e8e0ff" />
      
      {/* Desk */}
      <Desk />
      
      {/* Books stack on desk */}
      <Book position={[-1.2, -1.1, 0.3]} rotation={[0, 0.2, 0]} color="#6366f1" />
      <Book position={[-1.15, -0.95, 0.25]} rotation={[0, -0.1, 0]} color="#8b5cf6" />
      <Book position={[-1.1, -0.8, 0.35]} rotation={[0, 0.4, 0]} color="#3b82f6" />
      
      {/* Standing book */}
      <Book position={[0.8, -1, -0.5]} rotation={[0, 0.5, Math.PI / 2 - 0.15]} color="#7c3aed" />
      
      {/* Pencil */}
      <Pencil position={[0.3, -1.1, 0.6]} rotation={[0, 0.3, 0.8]} />
      
      {/* Graduation cap floating above */}
      <GraduationCap position={[0, 1.2, 0]} />
      
      {/* Lamp */}
      <Lamp position={[1.8, -1.35, -0.3]} />
      
      {/* Coffee cup */}
      <Coffee position={[1, -1.2, 0.7]} />
      
      {/* Floating atoms */}
      <FloatingAtom position={[-2.2, 0.8, -0.5]} />
      <FloatingAtom position={[2.5, 0.5, 0.5]} />
      
      {/* Background particles */}
      <BackgroundParticles />
      
      <Environment preset="city" />
    </>
  );
};

export const StudyScene3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
