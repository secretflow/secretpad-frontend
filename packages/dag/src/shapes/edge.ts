import { Graph } from '@antv/x6';

Graph.registerEdge(
  'dag-edge',
  {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#C2C8D5',
        strokeWidth: 1,
        targetMarker: null,
      },
    },
    zIndex: -1,
  },
  true,
);
