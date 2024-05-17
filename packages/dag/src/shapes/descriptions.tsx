import {
  ContainerOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Badge, Tooltip, Typography } from 'antd';

import { ActionType } from '../actions';
import { EllipsisMiddles } from '../component/ellipsis-middle';
import type { DAGProtocol } from '../protocol';
import { NodeStatus } from '../types';

import './index.less';
import { parseNodeId } from './utils';

const { Paragraph } = Typography;

enum statusColorEnum {
  success = 'success',
  error = 'error',
  default = 'default',
}

export const Description = (props: IProps) => {
  const { dagContext } = props;
  const { id, status, outputs, codeName, showContinueRun } = props.data;
  const { nodeNum } = parseNodeId(id);
  let statusDes = '';
  let statusColor = '';
  if (status === NodeStatus.success) {
    statusDes = '成功';
    statusColor = statusColorEnum.success;
  } else if (status === NodeStatus.failed) {
    statusDes = '失败';
    statusColor = statusColorEnum.error;
  } else if (status === NodeStatus.running) {
    statusDes = '执行中';
  } else if (status === NodeStatus.pending) {
    statusDes = '已提交';
  } else if (status === NodeStatus.default) {
    statusDes = '已配置';
  } else if (status === NodeStatus.stopped) {
    statusDes = '已停止';
  } else if (status === NodeStatus.unfinished) {
    statusDes = '待配置';
    statusColor = statusColorEnum.default;
  }

  return (
    <div className={'description'}>
      <div className={'bottom'}>
        <div className={'copy'}>
          <span>组件ID：</span>
          <span>
            <Paragraph
              copyable={{
                text: id,
                tooltips: ['复制', '复制成功'],
              }}
              style={{ marginBottom: 0, color: '#000000a6', fontSize: 12 }}
            >
              {nodeNum}
            </Paragraph>
          </span>
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span>执行状态：</span>
          <span>
            {statusColor && (
              <Badge
                status={statusColorEnum[statusColor as keyof typeof statusColorEnum]}
              />
            )}
            <span style={{ marginLeft: '4px' }}>{statusDes}</span>
          </span>
          {showContinueRun && (
            <span>
              <ContinueRunItem {...props} />
            </span>
          )}
        </div>
        {status === NodeStatus.success && outputs && (
          <div>
            <div style={{ marginBottom: '4px' }}>执行结果：</div>
            {outputs.map((output: any) => (
              <ResultItem
                output={output}
                key={output.id}
                codeName={codeName}
                dagContext={dagContext}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface IProps {
  data: any; // NodeData;
  dagContext: DAGProtocol;
}

const resultInfo: Record<string, { text: string; icon: any }> = {
  table: { text: '输出表', icon: <FileTextOutlined /> },
  model: { text: '模型', icon: <ExperimentOutlined /> },
  rule: { text: '规则', icon: <ContainerOutlined /> },
  report: { text: '报告', icon: <FileSearchOutlined /> },
};

const ResultItem = (props: {
  output: { name: string; id: string; type: string };
  codeName: string;
  dagContext: DAGProtocol;
}) => {
  const { output, codeName, dagContext } = props;
  const { name, type } = output;

  const onResultClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dagContext.graphManager.executeAction(ActionType.showResult, output.id, codeName);
  };

  return (
    <div className={'resultItem'} onClick={onResultClicked}>
      {resultInfo[type]?.icon}
      {resultInfo[type]?.text && (
        <span className={'title'}>{resultInfo[type].text}：</span>
      )}
      <Tooltip title={name}>
        <EllipsisMiddles className={'elllips'} maxWidth={130} suffixCount={3}>
          {name}
        </EllipsisMiddles>
      </Tooltip>
    </div>
  );
};

const ContinueRunItem = (props: IProps) => {
  const { dagContext } = props;
  const { id } = props.data;

  const onContinueRun = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dagContext.graphManager.executeAction(ActionType.continueRun, id);
    setTimeout(() => {
      dagContext.graphManager.executeAction(ActionType.queryStatus, []);
    }, 1500);
  };

  return (
    <span onClick={onContinueRun} className={'continueRunBtn'}>
      继续执行
    </span>
  );
};
