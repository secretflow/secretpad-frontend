import { Graph } from '@antv/x6';

Graph.registerEdge(
  'guide-edge',
  {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#E8EAEC',
        strokeWidth: 5,
        targetMarker: {
          tagName: 'path',
          strokeWidth: 2,
          d: 'M 10 -8 0 0 10 8 Z',
        },
      },
    },
    defaultLabel: {
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
      ],
      attrs: {
        text: {
          fill: '#878C93',
          fontSize: 12,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          pointerEvents: 'none',
        },
        rect: {
          ref: 'label',
          fill: '#fff',
          rx: 3,
          ry: 3,
          refWidth: 1,
          refHeight: 1,
          refX: 0,
          refY: 0,
        },
      },
      position: {
        distance: 0.5,
      },
    },
    zIndex: -1,
  },
  true,
);
