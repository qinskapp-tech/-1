import React from 'react';
import { TreeState } from '../types';

interface OverlayProps {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
}

const Overlay: React.FC<OverlayProps> = ({ treeState, setTreeState }) => {
  const isTree = treeState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      {/* Header */}
      <header className="flex flex-col items-center md:items-start space-y-2">
        <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-lg font-serif tracking-widest uppercase">
          Arix
        </h1>
        <h2 className="text-emerald-400/80 text-sm md:text-base tracking-[0.3em] font-light uppercase border-b border-emerald-800 pb-1">
          Signature Collection
        </h2>
      </header>

      {/* Center Controls */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center justify-center space-y-6 pointer-events-auto">
        <div className="backdrop-blur-md bg-black/30 p-1 rounded-full border border-white/10 shadow-2xl shadow-emerald-900/20">
            <button
            onClick={() => setTreeState(isTree ? TreeState.SCATTERED : TreeState.TREE_SHAPE)}
            className={`
                relative px-12 py-4 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-700 ease-out overflow-hidden group
                ${isTree 
                    ? 'bg-gradient-to-r from-emerald-900 to-black text-emerald-100 hover:text-white border border-emerald-700/50' 
                    : 'bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 text-black shadow-[0_0_40px_rgba(251,191,36,0.4)]'
                }
            `}
            >
            <span className="relative z-10">
                {isTree ? 'Release Magic' : 'Assemble Tree'}
            </span>
            
            {/* Hover shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </button>
        </div>

        <p className="text-white/40 text-xs font-mono tracking-wider">
            {isTree ? 'STATE: ASSEMBLED' : 'STATE: ETHEREAL'}
        </p>
      </div>
      
      {/* Footer / Corner Data */}
      <div className="hidden md:block absolute bottom-12 right-12 text-right">
        <div className="text-amber-500/80 font-serif italic text-xl">2025 Edition</div>
        <div className="text-white/20 text-xs mt-1">Interactive WebGL Experience</div>
      </div>
    </div>
  );
};

export default Overlay;