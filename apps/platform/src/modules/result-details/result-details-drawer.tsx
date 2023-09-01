import { Typography, Descriptions, Table, Drawer, Button, Tabs, Tooltip } from 'antd';
import React, { useEffect } from 'react';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { getTabsName, getVisComponents } from '@/modules/dag-result/result-report';
import { formatTimestamp } from '@/modules/dag-result/utils';
import type { ResultOriginData } from '@/modules/dag-result/vis/typing';
import { NodeService } from '@/modules/node';
import type { TableType } from '@/modules/result-manager/result-manager.protocol';
import {
  ResultManagerService,
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

  const { data, visible, close } = modal || {};

  const { Paragraph, Link } = Typography;

  const {
    nodeResultsVO = {},
    graphDetailVO = {},
    datasource,
  } = viewInstance.resultDetail;

  useEffect(() => {
    viewInstance.getResultDetail(data?.id);
  }, [data?.id]);

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

  return (
    <Drawer
      title={`「${nodeResultsVO.productName}」详情`}
      width={700}
      open={visible}
      onClose={close}
      closable={true}
      footer={
        nodeResultsVO?.datatableType !== 'report' ? (
          <div className={style.actions}>
            <Tooltip
              title={
                nodeService.currentNode?.type !== 'embedded'
                  ? `请到 ${datasource} 路径查看结果`
                  : ''
              }
            >
              <Button
                type="primary"
                disabled={nodeService.currentNode?.type !== 'embedded'}
                onClick={() => viewInstance.download()}
              >
                下载结果
              </Button>
            </Tooltip>
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
              <Link
                target="_blank"
                href={`/dag?projectId=${nodeResultsVO.sourceProjectId}&dagId=${graphDetailVO.graphId}`}
              >
                {nodeResultsVO.sourceProjectName}
              </Link>
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
        <div className={style.dagBox}>
          <PreviewGraphComponents
            graph={viewInstance.resultDetail.graphDetailVO as API.GraphDetailVO}
            id={data?.id}
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
                      <p
                        className={style.tableTitle}
                        style={{ fontWeight: 600, margin: '8px 0' }}
                      >
                        报告
                      </p>
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
                                  {getVisComponents(codeName, item, data?.id)}
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
                    <>
                      <p
                        className={style.tableTitle}
                        style={{ fontWeight: 600, margin: '8px 0' }}
                      >
                        表字段
                      </p>
                      <Table
                        dataSource={viewInstance.resultDetail.tableColumnVOList || []}
                        columns={tableColumns}
                        rowKey={(record) => record.colName as string}
                      />
                    </>
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
