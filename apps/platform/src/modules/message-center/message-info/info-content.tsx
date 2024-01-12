import { Descriptions, Tag, Typography } from 'antd';

import { EllipsisText } from '@/components/text-ellipsis.tsx';
import { formatTimestamp } from '@/modules/dag-result/utils';
import { DataTableStructure } from '@/modules/data-table-info/component/data-table-structure';
import { PreviewGraphComponents } from '@/modules/result-details/graph';
import { FullscreenGraphModalComponent } from '@/modules/result-details/graph-fullscreen-modal';

import { MessageTypeTag, NodeStatusList } from '../component/common';
import { StatusEnum } from '../message.service';

import styles from './index.less';

interface IProps {
  info: Record<string, any>;
}

export enum ComputedModelEnum {
  TEE = 'TEE',
  MPC = 'MPC',
}
export const ComputedModelObj = {
  [ComputedModelEnum.TEE]: '枢纽模式',
  [ComputedModelEnum.MPC]: '管道模式',
};

export enum ComputeFuncEnum {
  DAG = 'DAG',
  PSI = 'PSI',
  ALL = 'ALL',
}

export const ComputeFuncObj = {
  [ComputeFuncEnum.DAG]: '模型训练-联合建模',
  [ComputeFuncEnum.PSI]: '隐私求交',
  [ComputeFuncEnum.ALL]: '全家桶',
};

export const TeeDownloadInfo = (props: IProps) => {
  const { info } = props;
  return (
    <div>
      <Descriptions column={1}>
        <Descriptions.Item label="类型">
          <MessageTypeTag type={info.type} />
        </Descriptions.Item>
      </Descriptions>
      <Descriptions column={2}>
        <Descriptions.Item label="结果表名称">
          <EllipsisText width={110}>{info.messageName}</EllipsisText>
          <Tag className={styles.sheetTag}>表</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="来源项目">
          <EllipsisText width={110}>{info?.project?.projectName}</EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="所属训练流">
          <EllipsisText width={110}>{info.graphName}</EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="生成时间">
          <EllipsisText width={160}>
            {info?.project?.gmtCreated
              ? formatTimestamp(info?.project?.gmtCreated)
              : ''}
          </EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="计算模式">
          <EllipsisText>
            {
              ComputedModelObj[
                (info?.project?.computeMode as ComputedModelEnum) ||
                  ComputedModelEnum.MPC
              ]
            }
          </EllipsisText>
        </Descriptions.Item>
      </Descriptions>
      <Descriptions column={1}>
        <Descriptions.Item label="参与节点" className={styles.descNodeStatusList}>
          <NodeStatusList list={info?.partyVoteStatuses || []} />
        </Descriptions.Item>
        <Descriptions.Item label="任务ID">
          <Typography.Paragraph copyable>{info.taskID}</Typography.Paragraph>
        </Descriptions.Item>
      </Descriptions>
      <div className={styles.dagBoxContent}>
        <PreviewGraphComponents
          graph={info.graphDetailVO as API.GraphDetailVO}
          // id={'qavi-smutlwmh-node-10-output-0'}
          id={info.messageName}
          projectMode={info?.project?.computeMode || ComputedModelEnum.MPC}
        />
      </div>
      <div className={styles.sheetText}>表字段</div>
      <DataTableStructure schema={info?.tableColumns || []} />
      <FullscreenGraphModalComponent />
    </div>
  );
};

// 授权邀约
export const NodeAuthInfo = (props: IProps) => {
  const { info } = props;
  return (
    <div>
      <Descriptions column={1}>
        {info.status === StatusEnum.REJECT && (
          <Descriptions.Item label="拒绝原因">
            <EllipsisText>{info.reason}</EllipsisText>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="类型">
          <MessageTypeTag type={info.type} />
        </Descriptions.Item>
        <Descriptions.Item label="发起端节点">
          <EllipsisText>{info.initiatorNodeName}</EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="计算节点名">
          <EllipsisText>{info.nodeName}</EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="计算节点ID">
          <EllipsisText>{info.nodeID}</EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="节点通讯地址">
          <EllipsisText>{info.url}</EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="授权方式">
          <EllipsisText>{info.isSingle ? '单向通信授权' : '双向通信授权'}</EllipsisText>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

// 项目邀约&项目归档
export const ProjectInviteInfo = (props: IProps) => {
  const { info } = props;
  return (
    <div>
      <Descriptions column={1}>
        <Descriptions.Item label="类型">
          <MessageTypeTag type={info.type} />
        </Descriptions.Item>
        <Descriptions.Item label="项目名称">
          <EllipsisText>{info?.projectName}</EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="发起端节点">
          <EllipsisText>{info.initiatorNodeName}</EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          <EllipsisText>
            {info?.gmtCreated ? formatTimestamp(info?.gmtCreated) : ''}
          </EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="受邀节点" className={styles.descNodeStatusList}>
          <NodeStatusList list={info?.partyVoteStatuses || []} />
        </Descriptions.Item>
        <Descriptions.Item label="计算功能">
          <EllipsisText>
            {
              ComputeFuncObj[
                (info?.computeFunc as ComputeFuncEnum) || ComputeFuncEnum.DAG
              ]
            }
          </EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="计算模式">
          <EllipsisText>
            {
              ComputedModelObj[
                (info?.computeMode as ComputedModelEnum) || ComputedModelEnum.MPC
              ]
            }
          </EllipsisText>
        </Descriptions.Item>
        <Descriptions.Item label="项目描述">
          <EllipsisText>{info?.projectDesc}</EllipsisText>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

// 功能配置升级
export const ConfigUpdateInfo = () => {
  return <></>;
};
