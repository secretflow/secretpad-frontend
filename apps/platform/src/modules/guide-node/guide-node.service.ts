import { listNode } from '@/services/secretpad/NodeController';
import { Model } from '@/util/valtio-helper';

export type NodeVO = API.NodeVO & { type: 'embedded' | 'normal' };

export type NodeDatatableVO = API.NodeDatatableVO;

export type NodeRouteVO = API.NodeRouteVO;

export class GuideNodeContentServie extends Model {
  nodeListInfo: NodeVO[] = [];

  getListNode = async () => {
    const { data } = await listNode();

    this.nodeListInfo = (data as NodeVO[])?.filter(
      (i) => i.type === 'embedded',
    ) as NodeVO[];
  };
}
