import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import {
  Typography,
  Descriptions,
  Table,
  Drawer,
  Button,
  Tabs,
  Tooltip,
  Space,
  Badge,
  Progress,
} from 'antd';
import classNames from 'classnames';
import React, { useEffect } from 'react';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { getTabsName, getVisComponents } from '@/modules/dag-result/result-report';
import { formatTimestamp } from '@/modules/dag-result/utils';
import type { ResultOriginData } from '@/modules/dag-result/vis/typing';
import { NodeService } from '@/modules/node';
import type { TableType } from '@/modules/result-manager/result-manager.protocol';
import {
  ResultManagerService,
  ResultTableState,
  TableTypeMap,
} from '@/modules/result-manager/result-manager.service';
import { getNodeResultDetail } from '@/services/secretpad/NodeController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { PreviewGraphComponents } from './graph';
import { FullscreenGraphModalComponent } from './graph-fullscreen-modal';
import style from './index.less';

export const DagPreviewArea = 'DagPreviewArea';

export const ResultDetailsDrawer: React.FC = () => {
  const viewInstance = useModel(ResultDetailsView);

  const modalManager = useModel(DefaultModalManager);
  const nodeService = getModel(NodeService);
  const modal = modalManager.modals[resultDetailsDrawer.id];
  const fullScreenRef = React.useRef(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(fullScreenRef);
  const { data, visible, close } = modal || {};

  const { Paragraph, Link } = Typography;

  const {
    nodeResultsVO = {},
    graphDetailVO = {},
    datasource,
  } = viewInstance.resultDetail;

  useEffect(() => {
    visible && viewInstance.getResultDetail(data?.id);
  }, [data?.id, visible]);

  const tableColumns = [
    {
      title: '字段名称',
      dataIndex: 'colName',
      key: 'colName',
    },
    {
      title: '类型',
      dataIndex: 'colType',
      key: 'colType',
    },
    {
      title: '描述',
      dataIndex: 'colComment',
      key: 'colComment',
    },
  ];

  const getBadge = () => {
    if (nodeResultsVO.computeMode === 'MPC') {
      return null;
    } else if (nodeResultsVO.pullFromTeeStatus === ResultTableState.SUCCESS) {
      return <Badge status="success" text="获取成功" />;
    } else if (nodeResultsVO.pullFromTeeStatus === ResultTableState.RUNNING) {
      return <Badge status="processing" text="获取中" />;
    } else if (nodeResultsVO.pullFromTeeStatus === ResultTableState.FAILED) {
      return <Badge status="error" text="获取失败" />;
    }
  };

  return (
    <Drawer
      title={
        <div className={style.resultDrawerTitle}>
          <Space size="large">
            <div>{`「${nodeResultsVO.productName}」详情`}</div>
            <div style={{ width: 120 }}>{getBadge()}</div>
          </Space>
          <div className={style.close} onClick={close}>
            X
          </div>
        </div>
      }
      width={700}
      open={visible}
      onClose={close}
      closable={false}
      footer={
        nodeResultsVO?.datatableType !== 'report' &&
        viewInstance.nodeService?.currentNode?.nodeId !== 'tee' ? (
          <div className={style.actions}>
            {(nodeResultsVO?.pullFromTeeStatus === ResultTableState.SUCCESS ||
              nodeResultsVO?.pullFromTeeStatus === '') && (
              // <Tooltip
              //   title={
              //     nodeService.currentNode?.type !== 'embedded'
              //       ? `请到 ${datasource} 路径查看结果`
              //       : ''
              //   }
              // >
              <Button
                type="primary"
                // disabled={nodeService.currentNode?.type !== 'embedded'}
                onClick={() => viewInstance.download()}
              >
                下载结果
              </Button>
              // </Tooltip>
            )}
            {nodeResultsVO.pullFromTeeStatus === ResultTableState.FAILED && (
              <Button type="primary" onClick={() => viewInstance.download()}>
                重新获取
              </Button>
            )}
          </div>
        ) : (
          false
        )
      }
      mask={false}
    >
      <div className={style.details}>
        <div>
          <Descriptions column={2}>
            <Descriptions.Item label="结果类型">
              {TableTypeMap[nodeResultsVO.datatableType as TableType]}
            </Descriptions.Item>
            <Descriptions.Item label="来源项目">
              {/* 项目地址 `/dag?projectId=${nodeResultsVO.sourceProjectId}&dagId=${graphDetailVO.graphId}` */}
              {nodeResultsVO.sourceProjectName}
            </Descriptions.Item>
            <Descriptions.Item label="所属训练流">
              {nodeResultsVO.trainFlow}
            </Descriptions.Item>
            <Descriptions.Item label="生成时间">
              {nodeResultsVO.gmtCreate ? formatTimestamp(nodeResultsVO.gmtCreate) : ''}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions column={1} style={{ marginTop: '-1px' }}>
            <Descriptions.Item label="路径">
              {nodeResultsVO.relativeUri}
            </Descriptions.Item>
            <Descriptions.Item label="任务ID">
              <Paragraph copyable>{nodeResultsVO.jobId}</Paragraph>
            </Descriptions.Item>
          </Descriptions>
        </div>
        <div className={style.dagBoxContent}>
          <PreviewGraphComponents
            graph={viewInstance.resultDetail.graphDetailVO as API.GraphDetailVO}
            id={data?.id}
            // TODO: fetch the project mode
            projectMode={data?.projectMode || 'MPC'}
          />
        </div>

        <div className={style.tableWrapper}>
          <>
            {(() => {
              switch (nodeResultsVO.datatableType) {
                case 'report':
                  // eslint-disable-next-line
                  const { tabs = [], codeName } = viewInstance.resultDetail?.output || {
                    tabs: [],
                  };
                  if (!codeName) return <div>暂无结果</div>;
                  return (
                    <>
                      <div className={style.tableTitle}>报告</div>
                      <Tabs
                        className={style.tabsTable}
                        defaultActiveKey="1"
                        items={(tabs || []).map(
                          (item: ResultOriginData, index: number) => {
                            return {
                              label: getTabsName(item.name, index),
                              key: index,
                              children: (
                                <div key={index}>
                                  {getVisComponents(codeName, item, data?.id, true)}
                                </div>
                              ),
                            };
                          },
                        )}
                      />
                    </>
                  );
                case 'table':
                  return (
                    <div
                      ref={fullScreenRef}
                      className={classNames({
                        [style.fullScreenContentPage]: isFullscreen,
                      })}
                    >
                      <div
                        className={classNames({
                          [style.tableTitleContent]: isFullscreen,
                          [style.tableTitleHeader]: !isFullscreen,
                        })}
                      >
                        <span
                          className={classNames(style.tableTitle, {
                            [style.title]: isFullscreen,
                          })}
                        >
                          表字段
                        </span>
                        {!isFullscreen && (
                          <Space
                            onClick={enterFullscreen}
                            style={{ color: 'rgba(0,10,26,0.68)', cursor: 'pointer' }}
                          >
                            <FullscreenOutlined />
                            <span>全屏</span>
                          </Space>
                        )}
                        {isFullscreen && (
                          <Space
                            onClick={exitFullscreen}
                            style={{ color: 'rgba(0,10,26,0.68)', cursor: 'pointer' }}
                          >
                            <FullscreenExitOutlined />
                            <span>退出全屏</span>
                          </Space>
                        )}
                      </div>
                      <Table
                        className={classNames({
                          [style.fullScreenContentWrap]: isFullscreen,
                        })}
                        dataSource={viewInstance.resultDetail.tableColumnVOList || []}
                        columns={tableColumns}
                        rowKey={(record) => record.colName as string}
                      />
                    </div>
                  );
              }
            })()}
          </>
        </div>
        <FullscreenGraphModalComponent />
      </div>
    </Drawer>
  );
};

type NodeResultDetailVO = API.NodeResultDetailVO;

export class ResultDetailsView extends Model {
  resultDetail: NodeResultDetailVO = {};

  nodeService = getModel(NodeService);
  resultManagerService = getModel(ResultManagerService);

  async getResultDetail(id: string) {
    const resultResponse = await getNodeResultDetail({
      domainDataId: id,
      nodeId: this.nodeService.currentNode?.nodeId,
    });
    this.resultDetail = resultResponse.data || {};
  }

  download = () => {
    this.resultManagerService.download(
      this.nodeService.currentNode?.nodeId || '',
      this.resultDetail.nodeResultsVO as API.NodeResultsVO,
    );
  };
}

export const resultDetailsDrawer = {
  id: 'ResultDetails',
  visible: false,
};

getModel(DefaultModalManager).registerModal(resultDetailsDrawer);
