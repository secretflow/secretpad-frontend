import { CopyOutlined } from '@ant-design/icons';
import type { GraphNode } from '@secretflow/dag';
import { Descriptions, Empty, Flex, message, Space, Tooltip } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { useLocation } from 'umi';

import type { RenderProp } from '@/modules/component-config/config-item-render/config-render-protocol';
import { getGraphNodeOutput } from '@/services/secretpad/GraphController';

import styles from './index.less';

export type Feature = {
  tableName: string;
  tableFeatures: string[];
  nodeName: string;
};

export type UpstreamOutput = {
  id: string;
  outputId: string;
  codeName: string;
};

export const OutputFeatureShow: React.FC<RenderProp<Feature[]>> = (props) => {
  const { nodeAllInfo, onChange, value } = props;
  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };

  const { upstreamSampleNodes, graphNode, upstreamNodes } = nodeAllInfo;
  // 如果上游不是直接接的样本表，服务端要求名称是 各方的节点ID + 当前scql算子上游的输入 即graphNode 的 inputs[0]
  // 如果上游是样本表 则展示 各方的节点ID +  样本表ID
  const baseName = graphNode?.inputs?.[0];
  const upstreamIsSmapleNode = upstreamNodes[0]?.codeName === 'read_data/datatable';

  const [sheets, setSheets] = useState<Feature[]>([]);

  const { pathname } = useLocation();

  useEffect(() => {
    if (value) {
      setSheets(value);
    }
  }, [value]);

  const upstreamOutputs = useMemo(() => {
    return getUpstreamNodesOutputs(upstreamSampleNodes);
  }, [upstreamSampleNodes]);

  useEffect(() => {
    /** 直接获取最上游的样本表 */
    const getTablesFeature = async (outputs: UpstreamOutput[]) => {
      const tableInfos: Feature[] = [];
      await Promise.all(
        outputs.map(async (output) => {
          const { data } = await getGraphNodeOutput({
            projectId: projectId as string,
            graphId: dagId,
            graphNodeId: output.id,
            outputId: output.outputId,
          });
          if (!data) return;
          const { meta, type } = data;
          if (type === 'table') {
            if (meta?.rows?.length) {
              meta.rows.forEach((row) => {
                let tableName = '';
                if (upstreamIsSmapleNode) {
                  // 上游是样本表 则展示 各方的节点ID +  样本表ID（tableId）
                  tableName = `${row.nodeId}_${row.tableId}`;
                } else {
                  // 名称是上游的输出output + 当前的节点名称
                  tableName = `${row.nodeId}_${baseName}`;
                }
                tableInfos.push({
                  tableName: tableName.replaceAll('-', '_'),
                  tableFeatures: row.fields.split(','),
                  nodeName: row.nodeName,
                });
              });
            }
          }
        }),
      );
      setSheets(tableInfos);
      onChange(tableInfos);
    };
    if (pathname !== '/record') {
      getTablesFeature(upstreamOutputs);
    }
  }, [upstreamOutputs]);

  return <OutputFeatureContent sheets={sheets} />;
};

export const getUpstreamNodesOutputs = (upstreamNodes: GraphNode[]) => {
  if (upstreamNodes.length === 0) return [];
  const upstreamOutputs: UpstreamOutput[] = [];
  upstreamNodes?.forEach((n) => {
    const { id, outputs = [], codeName } = n || {};
    outputs.forEach((outputId: any) => {
      upstreamOutputs.push({
        id,
        outputId,
        codeName,
      });
    });
  });
  return upstreamOutputs;
};

export const OutputFeatureContent = (props: {
  sheets: Feature[];
  isFullScreen?: boolean;
}) => {
  const { sheets, isFullScreen = false } = props;

  const handleCopy = (text: string) => {
    message.config({
      getContainer: () => {
        return document.getElementById('scriptIdInput') as HTMLElement;
      },
    });
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('复制成功');
      })
      .catch(() => {
        message.error('复制失败');
      });
  };

  return (
    <div
      className={classNames(styles.content, {
        [styles.screenFullcontent]: isFullScreen,
      })}
    >
      {sheets.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            marginBlock: 0,
          }}
          description={'暂无输入'}
        />
      ) : (
        <Space direction="vertical" size="large">
          {sheets.map((item, index) => (
            <div
              key={`${item.tableName}_${index}`}
              className={styles.inputTableContent}
            >
              <Descriptions layout="horizontal" column={1}>
                <Descriptions.Item
                  label={`表${index + 1}`}
                  key={`${item.tableName}_${index}`}
                >
                  {item.tableName || '暂无输入表'}
                </Descriptions.Item>
                <Descriptions.Item label="节点名称">
                  {item.nodeName || '暂无名称'}
                </Descriptions.Item>
                <Descriptions.Item label={`特征列`} key={`${item.tableName}_${index}`}>
                  {item.tableFeatures.length === 0 ? (
                    '暂无特征'
                  ) : (
                    <Flex>
                      <Tooltip
                        title={item.tableFeatures.join(',')}
                        autoAdjustOverflow
                        placement="left"
                      >
                        <div
                          className={classNames(styles.ellipsisText, {
                            [styles.featureFull]: isFullScreen,
                          })}
                        >
                          {item.tableFeatures.join(',')}
                        </div>
                      </Tooltip>
                      <span onClick={() => handleCopy(item.tableFeatures.join(','))}>
                        <CopyOutlined className={styles.copy} />
                      </span>
                    </Flex>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
          ))}
        </Space>
      )}
    </div>
  );
};
