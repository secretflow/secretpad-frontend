import { MergeCellsOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { NodeStatus } from '@secretflow/dag';
import { Button, Tooltip, message } from 'antd';

import { GraphService } from '@/modules/main-dag/graph-service';
import { Model, getModel, useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import type { BinningData } from '../../types';
import { CurrOperationEnum } from '../../types';
import styles from '../index.less';
import { DefaultRedoUndoService } from '../../../redo-undo/redo-undo-service';

export const MergeOperation = () => {
  const {
    selectedRowKeys,
    parametersData,
    merge,
    setCurrOperation,
    disabled,
    selectedRowMap,
  } = useModel(BinModificationsRenderView);

  useModel(MergeBtnView);

  const handleMergeRow = async () => {
    if (!parametersData || selectedRowKeys.length <= 1) return;

    setCurrOperation(CurrOperationEnum.Merge);

    // 1. 标记要合并的 桶
    const markedParametersData = parametersData?.variableBins?.map((record) => {
      return {
        ...record,
        bins: record.bins?.map((bin) => {
          return {
            ...bin,
            markForMerge: selectedRowKeys.includes(bin.key),
          };
        }),
      };
    });

    // 2. 更新右侧面板配置 update nodeDef: updateBinningTable(markedParametersData);
    // 3. 执行算子 run single:execBinningCal();
    merge({
      modelHash: parametersData.modelHash,
      variableBins: markedParametersData,
    });
  };

  return (
    <span style={{ display: 'block-inline', paddingRight: 15 }}>
      <Button
        type="link"
        onClick={handleMergeRow}
        disabled={
          disabled ||
          !Object.values(selectedRowMap).some((item) => item.index.length > 1)
        }
        className={styles.operationBtn}
        style={{ paddingRight: 5 }}
      >
        <MergeCellsOutlined />
        合并
      </Button>
      <Tooltip title="合并操作会自动保存分箱并执行算子；撤销、前进等操作后的分箱需手动保存和执行算子">
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );
};

export class MergeBtnView extends Model {
  graphService = getModel(GraphService);
  undoService = getModel(DefaultRedoUndoService<BinningData>);
  binningModificationView = getModel(BinModificationsRenderView);

  prevStatus?: NodeStatus;

  constructor() {
    super();

    /** 监听 all node status */
    this.graphService.onNodeStatusChangedEvent(
      async (allNodeStatus: { nodeId: string; status: NodeStatus }[]) => {
        const isMerge =
          this.binningModificationView.currOperation === CurrOperationEnum.Merge;

        /** 仅在合并模式下：针对合并是否成功的监听 */
        if (isMerge) {
          const currNodeStatus = allNodeStatus?.find(
            (node) => this.binningModificationView.node?.nodeId === node.nodeId,
          )?.status;

          if (
            [NodeStatus.running, NodeStatus.pending].includes(
              currNodeStatus as NodeStatus,
            )
          ) {
            this.prevStatus = currNodeStatus;
            this.binningModificationView.setLoading(true);
          } else {
            this.binningModificationView.setLoading(false);
          }

          if (
            currNodeStatus === NodeStatus.success &&
            this.prevStatus !== currNodeStatus
          ) {
            // 拿到合并后的数据
            const parametersData = await this.binningModificationView.refreshData();

            if (parametersData) {
              message.success('合并成功');
              this.prevStatus = currNodeStatus;

              this.undoService.record(parametersData);
              this.binningModificationView.setSelectedRowKeys([]);
            }
          }

          if (
            currNodeStatus === NodeStatus.failed &&
            this.prevStatus !== currNodeStatus
          ) {
            message.error('合并失败！请重新尝试');
            this.prevStatus = currNodeStatus;
          }
        }
      },
    );
  }
}
