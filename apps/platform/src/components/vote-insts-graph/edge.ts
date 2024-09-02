import { Graph } from '@antv/x6';

Graph.registerEdge(
  'custom-vote-edge',
  {
    inherit: 'edge',
    connector: { name: 'smooth' },
    attrs: {
      line: {
        stroke: '#C1C7D0',
        strokeWidth: 1,
        opacity: 1,
        targetMarker: {},
      },
    },
  },
  true,
);
