import { parse } from 'query-string';

const portsConfig = {
  ports: {
    items: [
      { group: 'out', id: 'out-1' },
      { group: 'in', id: 'in-1' },
    ],
    groups: {
      out: {
        position: { name: 'right' },
        attrs: {
          circle: {
            r: 0,
            magnet: true,
          },
        },
      },
      in: {
        position: { name: 'left' },
        attrs: {
          circle: {
            r: 0,
            magnet: true,
          },
        },
      },
    },
  },
};

export const convertToNodeData = (voteInstsNodes) => {
  const groupNodeIds = [];
  const nodeData = voteInstsNodes.participantNodeInstVOS?.reduce(
    (acc, voteNode, index) => {
      const instsStatus = voteInstsNodes.partyVoteStatuses?.find(
        (inst) => inst.participantID === voteInstsNodes.initiatorId,
      );
      const { participantName, action } = instsStatus || {};
      const { ownerId } = parse(window.location.search);
      const isOurNode = voteInstsNodes.initiatorId === ownerId;

      const initatorNode = {
        id: voteNode.initiatorNodeId + '-' + index,
        shape: 'custom-vote-node',
        ...portsConfig,

        data: {
          instId: voteInstsNodes.initiatorId, // 暂没用到
          instName: participantName,
          nodeId: voteNode.initiatorNodeId,
          nodeName: voteNode.initiatorNodeName,
          isOurNode,
          isInitiator: true,
          action: action,
        },
      };
      acc.push(initatorNode);

      const group = [];
      group.push(voteNode.initiatorNodeId + '-' + index);

      voteNode.invitees.forEach((invitee) => {
        const isOurNode = invitee.instId === ownerId;
        const instsStatus = voteInstsNodes.partyVoteStatuses?.find(
          (inst) => inst.participantID === invitee.instId,
        );
        const { action } = instsStatus || {};

        const inviteeNode = {
          id: invitee.inviteeId + '-' + index,
          shape: 'custom-vote-node',
          ...portsConfig,
          data: {
            instId: invitee.instId,
            instName: invitee.instName,
            nodeId: invitee.inviteeId,
            nodeName: invitee.inviteeName,
            isOurNode,
            isInitiator: false,
            action: action,
          },
        };

        group.push(invitee.inviteeId + '-' + index);

        acc.push(inviteeNode);
      });

      groupNodeIds.push(group);

      return acc;
    },
    [],
  );

  const edgeData = voteInstsNodes.participantNodeInstVOS?.reduce(
    (edges, voteNode, index) => {
      const sourceId = voteNode.initiatorNodeId + '-' + index;

      voteNode.invitees.forEach((invitee) => {
        const targetId = invitee.inviteeId + '-' + index;

        const edge = {
          id: `${sourceId}-${targetId}`,
          shape: 'custom-vote-edge',
          attrs: {
            line: {
              targetMarker: {
                args: { size: 6 },
                name: 'block',
              },

              strokeWidth: 1,
            },
          },
          source: {
            cell: sourceId,
            port: 'out-1',
          },
          target: {
            cell: targetId,
            port: 'in-1',
          },
        };

        edges.push(edge);
      });

      return edges;
    },
    [],
  );
  return { nodeData, edgeData, groupNodeIds };
};
