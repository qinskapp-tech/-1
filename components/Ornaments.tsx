import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface OrnamentsProps {
  treeState: TreeState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const giftMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const baubleCount = 150;
  const giftCount = 40;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // --- Baubles Data (Spheres) ---
  const baubles = useMemo(() => {
    const temp = [];
    const scatterRadius = 14;
    const treeHeight = 10;
    const treeBaseRadius = 3.8; // Slightly wider than foliage

    for (let i = 0; i < baubleCount; i++) {
      // Scatter Pos
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 4 + Math.random() * scatterRadius; 
      const xS = r * Math.sin(phi) * Math.cos(theta);
      const yS = r * Math.sin(phi) * Math.sin(theta);
      const zS = r * Math.cos(phi);

      // Tree Pos
      const yNorm = Math.random(); 
      const yT = (yNorm - 0.5) * treeHeight;
      const currentRadius = (1 - yNorm) * treeBaseRadius;
      // Place exactly on surface or slightly outside
      const rCone = currentRadius + 0.1; 
      const angle = Math.random() * Math.PI * 2;

      const xT = rCone * Math.cos(angle);
      const zT = rCone * Math.sin(angle);

      temp.push({
        scatterPos: new THREE.Vector3(xS, yS, zS),
        treePos: new THREE.Vector3(xT, yT, zT),
        scale: 0.15 + Math.random() * 0.25,
        color: Math.random() > 0.6 ? '#FFD700' : '#C0C0C0', // Gold or Silver
        speed: 0.5 + Math.random(),
        phase: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  // --- Gifts Data (Boxes - Heavier look) ---
  const gifts = useMemo(() => {
    const temp = [];
    const scatterRadius = 8; // Gifts stay lower/closer when scattered
    const treeHeight = 10;
    const treeBaseRadius = 4.2; 

    for (let i = 0; i < giftCount; i++) {
      // Scatter Pos
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * scatterRadius;
      // Gifts scatter closer to ground
      const xS = r * Math.cos(theta);
      const yS = -5 + Math.random() * 3; 
      const zS = r * Math.sin(theta);

      // Tree Pos - Base of the tree
      const angle = (i / giftCount) * Math.PI * 2 * 2; // Wrap twice
      const rCone = treeBaseRadius + 0.5 + Math.random() * 1.5;
      const xT = rCone * Math.cos(angle);
      const zT = rCone * Math.sin(angle);
      const yT = -5 + (Math.random() * 1.5); // At the floor

      temp.push({
        scatterPos: new THREE.Vector3(xS, yS, zS),
        treePos: new THREE.Vector3(xT, yT, zT),
        scale: 0.4 + Math.random() * 0.4,
        color: Math.random() > 0.5 ? '#800020' : '#034528', // Burgundy or Emerald
        rotation: new THREE.Euler(0, Math.random() * Math.PI, 0),
      });
    }
    return temp;
  }, []);

  // Animation Refs
  const currentMorph = useRef(0);
  const targetMorph = treeState === TreeState.TREE_SHAPE ? 1 : 0;

  useFrame((state, delta) => {
    // Smooth morph transition
    currentMorph.current = THREE.MathUtils.lerp(currentMorph.current, targetMorph, delta * 1.5);
    const progress = currentMorph.current;

    // --- Update Baubles ---
    if (meshRef.current) {
        baubles.forEach((data, i) => {
            const { scatterPos, treePos, scale, speed, phase } = data;
            
            // Interpolate position
            const x = THREE.MathUtils.lerp(scatterPos.x, treePos.x, progress);
            const y = THREE.MathUtils.lerp(scatterPos.y, treePos.y, progress);
            const z = THREE.MathUtils.lerp(scatterPos.z, treePos.z, progress);
            
            // Add floating noise
            const time = state.clock.elapsedTime;
            // Float is stronger when scattered (1-progress)
            const floatAmp = (1 - progress) * 0.5; 
            const floatY = Math.sin(time * speed + phase) * floatAmp;

            dummy.position.set(x, y + floatY, z);
            dummy.scale.setScalar(scale);
            dummy.rotation.set(0, time * 0.2, 0); // Gentle spin
            dummy.updateMatrix();
            
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- Update Gifts ---
    if (giftMeshRef.current) {
        gifts.forEach((data, i) => {
            const { scatterPos, treePos, scale, rotation } = data;
             
            // Interpolate position
            const x = THREE.MathUtils.lerp(scatterPos.x, treePos.x, progress);
            const y = THREE.MathUtils.lerp(scatterPos.y, treePos.y, progress);
            const z = THREE.MathUtils.lerp(scatterPos.z, treePos.z, progress);

            // Gifts rotate when flying, land flat when tree
            const rotX = THREE.MathUtils.lerp(rotation.x + Math.sin(state.clock.elapsedTime), 0, progress);
            const rotY = rotation.y;
            const rotZ = THREE.MathUtils.lerp(rotation.z + Math.cos(state.clock.elapsedTime), 0, progress);

            dummy.position.set(x, y, z);
            dummy.rotation.set(rotX, rotY, rotZ);
            dummy.scale.setScalar(scale);
            dummy.updateMatrix();

            giftMeshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        giftMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Set Colors once
  useLayoutEffect(() => {
      if (meshRef.current) {
          baubles.forEach((data, i) => {
              meshRef.current!.setColorAt(i, new THREE.Color(data.color));
          });
          meshRef.current.instanceColor!.needsUpdate = true;
      }
      if (giftMeshRef.current) {
        gifts.forEach((data, i) => {
            giftMeshRef.current!.setColorAt(i, new THREE.Color(data.color));
        });
        giftMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [baubles, gifts]);

  return (
    <>
      {/* Baubles - Metallic */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, baubleCount]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            metalness={0.9} 
            roughness={0.1} 
            envMapIntensity={2} 
        />
      </instancedMesh>

      {/* Gifts - Velvet/Paper */}
      <instancedMesh ref={giftMeshRef} args={[undefined, undefined, giftCount]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            metalness={0.1} 
            roughness={0.6} 
            envMapIntensity={0.5}
        />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
