export const parseNodeId = (nodeId: string) => {
  // pipeline1-node-1
  const list = nodeId.split('-');
  if (list.length !== 3) {
    throw new Error('invalid node id');
  }
  return {
    dagId: list[0],
    nodeNum: parseInt(list[2], 10),
  };
};
