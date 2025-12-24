import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { TreeState } from '../types';

// Custom Shader for the Foliage (Needles/Sparkles)
const FoliageMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorHigh: new THREE.Color('#FFD700'), // Gold
    uColorLow: new THREE.Color('#033820'),  // Deep Emerald
    uMorphFactor: 0, // 0 = Scattered, 1 = Tree
    uPixelRatio: 1,
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uMorphFactor;
    uniform float uPixelRatio;
    
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying float vRandom;
    varying vec3 vPos;

    // Cubic bezier easing for smoother transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vRandom = aRandom;
      
      // Calculate morph progress
      float progress = easeInOutCubic(uMorphFactor);
      
      // Mix positions
      vec3 pos = mix(aScatterPos, aTreePos, progress);
      vPos = pos;

      // Add "breathing" / floating effect
      float breath = sin(uTime * 2.0 + aRandom * 10.0) * 0.05;
      
      // Floating is stronger when scattered
      float floatStrength = mix(1.0, 0.1, progress); 
      pos.y += breath * floatStrength;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = (4.0 * uPixelRatio + aRandom * 2.0) * (20.0 / -mvPosition.z);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColorHigh;
    uniform vec3 uColorLow;
    varying float vRandom;

    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;

      // Gradient from center (gold/light) to edge (emerald)
      // We flip standard logic: center is bright, edge is dark
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 1.5);

      vec3 color = mix(uColorLow, uColorHigh, strength * 0.8 + vRandom * 0.2);
      
      // Add a glow/alpha falloff
      gl_FragColor = vec4(color, strength);
    }
  `
);

extend({ FoliageMaterial });

interface FoliageProps {
  treeState: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const materialRef = useRef<any>(null);
  const count = 8000; // Number of needles
  
  // Target value for morphing
  const targetMorph = treeState === TreeState.TREE_SHAPE ? 1 : 0;

  const data = useMemo(() => {
    const scatterPos = new Float32Array(count * 3);
    const treePos = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    const scatterRadius = 12;
    const treeHeight = 10;
    const treeBaseRadius = 3.5;

    for (let i = 0; i < count; i++) {
      // 1. Scattered Position (Random Sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = Math.cbrt(Math.random()) * scatterRadius; // cbrt for uniform volume
      
      const xS = r * Math.sin(phi) * Math.cos(theta);
      const yS = r * Math.sin(phi) * Math.sin(theta);
      const zS = r * Math.cos(phi);
      
      scatterPos[i * 3] = xS;
      scatterPos[i * 3 + 1] = yS;
      scatterPos[i * 3 + 2] = zS;

      // 2. Tree Position (Cone Volume)
      // Cone math: y goes from -height/2 to height/2
      const yNorm = Math.random(); // 0 to 1 (bottom to top)
      const yT = (yNorm - 0.5) * treeHeight;
      
      // Radius decreases as we go up
      const currentRadius = (1 - yNorm) * treeBaseRadius;
      
      // Distribute points within the cone volume (mostly surface, some inner)
      const rCone = currentRadius * Math.sqrt(Math.random() * 0.8 + 0.2); // Bias towards outer shell
      const angle = Math.random() * Math.PI * 2;
      
      // Spiral clustering for a more natural look
      const spiralAngle = angle + yNorm * 10.0;

      treePos[i * 3] = rCone * Math.cos(spiralAngle);
      treePos[i * 3 + 1] = yT;
      treePos[i * 3 + 2] = rCone * Math.sin(spiralAngle);

      // Random attribute for glitter/size variation
      randoms[i] = Math.random();
    }

    return { scatterPos, treePos, randoms };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uPixelRatio = Math.min(window.devicePixelRatio, 2);
      
      // Smoothly interpolate the morph factor
      const speed = 2.0;
      materialRef.current.uMorphFactor = THREE.MathUtils.lerp(
        materialRef.current.uMorphFactor,
        targetMorph,
        delta * speed
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Required by three, though we override in shader
          count={count}
          array={data.scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={data.scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={data.treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={data.randoms}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore - shaderMaterial creates a JSX element */}
      <foliageMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

export default Foliage;
