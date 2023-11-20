import { Button, Tag, Typography } from 'antd';
import { parse } from 'query-string';

import { Download } from '@/modules/dag-result/apply-download';

import style from './index.less';
import type { ResultComponentProps } from './types';
import { formatTimestamp } from './utils';

const { Paragraph } = Typography;

export const ResultRuleComponent = (props: ResultComponentProps<'rule'>) => {
  const { data, id } = props;
  const { mode, projectId } = parse(window.location.search);
  const { gmtCreate, meta, jobId, taskId, type } = data;
  const { rows } = meta;

  return (
    <div className={style.report}>
      <div className={style.item}>
        <span className={style.name}>{id}</span>
        <Tag color="rgba(0,104,250,0.08)">规则</Tag>
      </div>

      {gmtCreate && (
        <div className={style.item}>
          <span className={style.timeLabel}>生成时间：</span>
          <span>{formatTimestamp(gmtCreate)}</span>
        </div>
      )}

      {rows.map((row, index) => {
        const { path, nodeId, tableId, type: nodeType } = row;

        return (
          <div className={style.ruleContent} key={`rule-${path}-${index}`}>
            <Paragraph
              copyable={{
                text: path,
                tooltips: ['复制', '复制成功'],
              }}
            >
              <div className={style.item}>
                <span className={style.timeLabel}>{nodeId}规则路径：</span>
                <span>{path}</span>
                {/* 内置节点才展示查看结果跳转 */}
                {nodeType === 'embedded' && (
                  <Button
                    type="link"
                    size="small"
                    style={{ paddingLeft: 20 }}
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = `/node?nodeId=${nodeId}&tab=result&resultName=${path}`;
                      a.target = '_blank';
                      a.click();
                    }}
                  >
                    查看结果
                  </Button>
                )}
              </div>
            </Paragraph>
            {mode === 'TEE' && (
              <Download
                params={{
                  nodeID: nodeId,
                  taskID: taskId,
                  jobID: jobId,
                  projectID: projectId as string,
                  resourceType: type,
                  resourceID: tableId,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
