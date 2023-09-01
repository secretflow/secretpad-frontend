import { Tour } from 'antd';

import resultPanelImg from '@/assets/dag-record-guide.svg';
import {
  GuideTourKeys,
  GuideTourService,
} from '@/modules/guide-tour/guide-tour-service';
import type { ResultType } from '@/modules/pipeline-record-list/record-protocol';
import { DefaultRecordService } from '@/modules/pipeline-record-list/record-service';
import { getModel, Model, useModel } from '@/util/valtio-helper';

export const RecordGuideTourID = 'dag-record-guide-tour';

import styles from './index.less';

export const RecordGuideTourComponent = () => {
  const viewInstance = useModel(DAGRecordGuideTour);
  const steps = [
    {
      title: '执行结果在下拉面板里哦～',
      cover: <img src={resultPanelImg as any} className={styles.img} />,
      description: '点击结果可查看相应的结果内容',
      prevButtonProps: {
        style: {
          display: 'none',
        },
      },
      nextButtonProps: {
        onClick: viewInstance.closeTour,
        children: <span>知道了</span>,
      },
      target: () => {
        const nodes: any = document.querySelectorAll('.dag-node:not(.opaque) .label');
        return nodes[0]?.parentNode?.parentNode;
      },
    },
  ];
  return (
    <div className={styles.tour}>
      <Tour
        open={
          !viewInstance.guideTourService.RecordGuideTour &&
          viewInstance.selectedResultType !== undefined &&
          viewInstance.firstHighlightNode
        }
        onClose={() => viewInstance.closeTour()}
        type="primary"
        steps={steps}
        placement="right"
        prefixCls="recordTour"
      />
    </div>
  );
};

export class DAGRecordGuideTour extends Model {
  token = '';

  refMaps = {};

  selectedResultType: ResultType | undefined;

  firstHighlightNode = false;

  guideTourService = getModel(GuideTourService);
  recordService = getModel(DefaultRecordService);

  constructor() {
    super();
    this.recordService.onResultTypeReset((type) => {
      this.setSelectedResultType(type);
    });
  }

  setSelectedResultType(type: ResultType | undefined) {
    const filteredNodes = this.recordService.filterGraphNodeByType();
    const nodes = this.recordService.currentRecord?.graph?.nodes;
    if (nodes && nodes.length !== filteredNodes.length) this.firstHighlightNode = true;
    this.selectedResultType = type;
  }

  closeTour = () => {
    this.guideTourService.finishTour(GuideTourKeys.RecordGuideTour);
  };
}
