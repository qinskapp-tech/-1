export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  scatterPos: [number, number, number];
  treePos: [number, number, number];
}

export interface OrnamentData {
  id: number;
  positions: DualPosition;
  rotation: [number, number, number];
  scale: number;
  color: string;
  type: 'GIFT' | 'BAUBLE' | 'STAR';
  speedOffset: number; // For varying floating speeds
}
