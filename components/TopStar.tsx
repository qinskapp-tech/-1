import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface TopStarProps {
  treeState: TreeState;
}

const TopStar: React.FC<TopStarProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate a procedural 5-pointed star shape
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.0;
    const innerRadius = 0.5;

    // Start angle: PI/2 ensures the first point points straight up
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
      
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  // Calculate Positions
  const { scatterPos, treePos } = useMemo(() => {
    // 1. Tree Position: The absolute apex of the tree. 
    // Foliage goes from -5 to 5, so 5.8 sits nicely on top.
    const treePos = new THREE.Vector3(0, 5.8, 0);

    // 2. Scatter Position: Randomly floating in the ether
    const r = 10 + Math.random() * 8; // Further out than some ornaments
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    const scatterPos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    return { scatterPos, treePos };
  }, []);

  // Animation State
  const currentMorph = useRef(0);
  const targetMorph = treeState === TreeState.TREE_SHAPE ? 1 : 0;

  useFrame((state, delta) => {
    // 1. Interpolate Morph Factor (0 to 1)
    const speed = 1.5;
    currentMorph.current = THREE.MathUtils.lerp(currentMorph.current, targetMorph, delta * speed);
    const progress = currentMorph.current;

    if (meshRef.current) {
      // 2. Position Interpolation
      meshRef.current.position.lerpVectors(scatterPos, treePos, progress);

      // 3. Rotation Logic
      const time = state.clock.elapsedTime;
      
      // Always spin on Y for grandeur
      const spinSpeed = 0.5;
      
      if (progress > 0.8) {
        // When assembled: Upright spin
        // Smoothly return rotation.x and z to 0
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 2);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 2);
        meshRef.current.rotation.y += delta * spinSpeed;
      } else {
        // When scattered: Tumble slightly
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.2;
        meshRef.current.rotation.z += delta * 0.1;
      }

      // 4. Bobbing/Floating Effect
      // More intense when scattered
      const floatAmp = THREE.MathUtils.lerp(0.5, 0.05, progress); 
      meshRef.current.position.y += Math.sin(time * 1.5) * floatAmp * delta;
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {/* ExtrudeGeometry gives the 2D star shape 3D depth */}
      <extrudeGeometry 
        args={[
          starShape, 
          { 
            depth: 0.3, 
            bevelEnabled: true, 
            bevelThickness: 0.1, 
            bevelSize: 0.05, 
            bevelSegments: 4 
          }
        ]} 
      />
      {/* High-end Gold Material */}
      <meshStandardMaterial 
        color="#FFD700"
        emissive="#FF8800"
        emissiveIntensity={0.4}
        metalness={1.0}
        roughness={0.1}
      />
    </mesh>
  );
};

export default TopStar;