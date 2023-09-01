import type { Edge, Node } from '@antv/x6';

export const validateConnection = (
  sourceNode: Node,
  targetNode: Node,
  sourceMagnet: Element,
  targetMagnet: Element,
  edges: Edge[],
) => {
  // 只能从 bottom 连接桩开始连接，连接到 top 连接桩
  if (!sourceMagnet || sourceMagnet.getAttribute('port-group') === 'top') {
    return false;
  }
  if (!targetMagnet || targetMagnet.getAttribute('port-group') !== 'top') {
    return false;
  }

  // 不能重复连线
  const port = targetMagnet.getAttribute('port') as string;
  if (edges.find((edge) => edge.getTargetPortId() === port)) {
    return false;
  }

  //连接桩类型校验
  let res = true;
  const sourcePortId = sourceMagnet.getAttribute('port') as string;
  const sourcePortType = sourceNode.getPort(sourcePortId)?.type;

  const targetPortId = targetMagnet.getAttribute('port') as string;
  const targetPortType = targetNode.getPort(targetPortId)?.type;

  for (const sourceType of sourcePortType) {
    // const res = targetPortType.indexOf(sourceType);
    if (targetPortType.indexOf(sourceType) < 0) {
      res = false;
      break;
    }
  }

  return res;
};

export const splitNodeId = (nodeId: string) => {
  // test_node_1
  const list = nodeId.split('-');
  if (list.length !== 3) {
    throw new Error('invalid node id');
  }
  return {
    dagId: list[0],
    index: parseInt(list[2], 10),
  };
};

export const splitPortId = (portId: string) => {
  // test_node_1_output_1
  const list = portId.split('-');
  if (list.length !== 5) {
    throw new Error('invalid port id');
  }
  const nodeId = list.slice(0, 3).join('-');
  return {
    nodeId,
    type: list[3] as 'input' | 'output',
    index: parseInt(list[4], 10),
  };
};
