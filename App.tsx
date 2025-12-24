import React, { useState } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden font-sans">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* UI Overlay Layer */}
      <Overlay treeState={treeState} setTreeState={setTreeState} />
    </div>
  );
};

export default App;
