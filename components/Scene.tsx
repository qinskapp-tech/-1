import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import TopStar from './TopStar';

interface SceneProps {
  treeState: TreeState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2}
        minDistance={10}
        maxDistance={40}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Lighting Strategy: Moody & Cinematic */}
      <ambientLight intensity={0.2} color="#001a10" />
      
      {/* Warm Gold Light from top */}
      <spotLight 
        position={[0, 20, 0]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={2} 
        color="#ffeebb" 
        castShadow 
      />
      
      {/* Fill Lights */}
      <pointLight position={[-10, 5, 10]} intensity={1} color="#00ff88" distance={30} />
      <pointLight position={[10, -5, -10]} intensity={1} color="#ffaa00" distance={30} />

      {/* Background Environment */}
      <color attach="background" args={['#010a05']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      {/* 3D Content */}
      <Suspense fallback={null}>
        <group position={[0, -2, 0]}>
            <Foliage treeState={treeState} />
            <Ornaments treeState={treeState} />
            <TopStar treeState={treeState} />
        </group>
      </Suspense>

      {/* Post Processing for the "Glow" */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} // Only very bright things glow
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;