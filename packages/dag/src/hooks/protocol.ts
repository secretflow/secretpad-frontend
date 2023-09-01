import type { GraphPort, GraphNodeOutput } from '../types';

export type HookService = {
  createPort(nodeId: string, codeName: string): Promise<GraphPort[]>;
  createResult: (nodeId: string, codeName: string) => Promise<GraphNodeOutput[]>;
};
