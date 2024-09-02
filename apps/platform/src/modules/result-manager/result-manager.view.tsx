import { SearchOutlined } from '@ant-design/icons';
import { Input, Table, Typography, Button, Badge, Space, Tooltip } from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { parse } from 'query-string';
import { useEffect, type ChangeEvent } from 'react';
import { history } from 'umi';

import { hasAccess, Platform } from '@/components/platform-wrapper';
import type { ComputeMode } from '@/modules/component-tree/component-protocol';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { formatTimestamp } from '@/modules/dag-result/utils';
import {
  resultDetailsDrawer,
  ResultDetailsDrawer,
} from '@/modules/result-details/result-details-drawer';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { DataSourceType } from '../data-source-list/type';

import { BatchDeleteModal } from './batch-delete/batch-delete.view';
import styles from './index.less';
import type { TableType } from './result-manager.protocol';
import {
  ResultManagerService,
  ResultTableState,
  TableTypeMap,
} from './result-manager.service';

const { Link } = Typography;

export const ResultManagerComponent = () => {
  const viewInstance = useModel(ResultManagerView);
  const isAutonomy = hasAccess({ type: [Platform.AUTONOMY] });
  const { ownerId } = parse(window.location.search);

  const renderButtons = (record: API.NodeResultsVO) => {
    if (record.datatableType === 'report') {
      return '-';
    } else if (isAutonomy) {
      return (
        <Space>
          {/* 暂时注释 */}
          {/* {record.datatableType === 'report' && (
            <Popconfirm
              title="确定要复制到数据管理吗？"
              onConfirm={() => viewInstance.copy(record)}
              okText="复制"
              cancelText="取消"
            >
              <Button type="link" style={{ paddingLeft: 0 }}>
                复制
              </Button>
            </Popconfirm>
          )} */}
          <Tooltip
            title={
              record?.datasourceType === DataSourceType.OSS ||
              record?.datasourceType === DataSourceType.ODPS
                ? `${record?.datasourceType} 文件不支持直接下载，请到 ${record?.datasourceType} 对应 bucket 的预设路径下找到文件下载，地址：${record.relativeUri}`
                : ''
            }
          >
            <Button
              type="link"
              style={{ paddingLeft: 0 }}
              onClick={() => viewInstance.download(record, isAutonomy)}
              disabled={
                record?.datasourceType === DataSourceType.OSS ||
                record?.datasourceType === DataSourceType.ODPS
              }
            >
              下载
            </Button>
          </Tooltip>
          {/* <Button
            type="link"
            style={{ paddingLeft: 0 }}
            onClick={() => viewInstance.delete(record)}
          >
            删除
          </Button> */}
        </Space>
      );
    } else if (
      record?.pullFromTeeStatus === ResultTableState.SUCCESS ||
      record?.pullFromTeeStatus === ''
    ) {
      return (
        <Tooltip
          title={
            record?.datasourceType === DataSourceType.OSS ||
            record?.datasourceType === DataSourceType.ODPS
              ? `${record?.datasourceType} 文件不支持直接下载，请到 ${record?.datasourceType} 对应 bucket 的预设路径下找到文件下载，地址：${record.relativeUri}`
              : ''
          }
        >
          <Button
            type="link"
            style={{ paddingLeft: 0 }}
            onClick={() => viewInstance.download(record, isAutonomy)}
            disabled={
              record?.datasourceType === DataSourceType.OSS ||
              record?.datasourceType === DataSourceType.ODPS
            }
          >
            下载
          </Button>
        </Tooltip>
      );
    } else if (record?.pullFromTeeStatus === ResultTableState.FAILED) {
      return (
        <Button
          type="link"
          style={{ paddingLeft: 0 }}
          onClick={() => viewInstance.download(record, isAutonomy)}
        >
          重新获取
        </Button>
      );
    } else if (record?.pullFromTeeStatus === ResultTableState.RUNNING) {
      return (
        <Button type="link" disabled>
          -
        </Button>
      );
    }
  };

  const columnsNodeNameFilter = viewInstance.resultManagerService.autonomyNodeList
    .filter((node) => node.nodeStatus === 'Ready')
    .map((item: API.NodeVO) => ({
      text: item.nodeName,
      value: item.nodeId,
    }));
  const columns = [
    {
      title: '结果ID',
      dataIndex: 'domainDataId',
      key: 'domainDataId',
      width: '20%',
      ellipsis: true,
      // todo 待补充隐藏条件
      hide: true,
      render: (text: string, record: API.NodeResultsVO) => {
        return (
          <Link
            ellipsis
            onClick={() =>
              viewInstance.showDrawer(
                `「${text}」详情`,
                record.domainDataId as string,
                (record?.computeMode || 'MPC') as ComputeMode,
                isAutonomy ? record?.nodeId : ownerId,
              )
            }
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: '结果类型',
      dataIndex: 'datatableType',
      key: 'datatableType',
      width: '10%',
      filters: [
        {
          text: '规则',
          value: 'rule',
        },
        {
          text: '模型',
          value: 'model',
        },
        {
          text: '表',
          value: 'table',
        },
        {
          text: '报告',
          value: 'report',
        },
      ],
      render: (value: TableType) => <span>{TableTypeMap[value]}</span>,
    },
    {
      title: '来源项目',
      dataIndex: 'sourceProjectName',
      key: 'sourceProjectName',
      width: '15%',
      render: (sourceProject: string) => <span>{sourceProject}</span>,
    },
    {
      title: '所属训练流',
      dataIndex: 'trainFlow',
      width: '15%',
    },
    {
      title: '所属节点',
      dataIndex: 'nodeName',
      width: '15%',
      filters: columnsNodeNameFilter,
    },
    {
      title: '生成时间',
      dataIndex: 'gmtCreate',
      width: '15%',
      sorter: true,
      ellipsis: true,
      render: (gmtCreate: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: formatTimestamp(gmtCreate),
          }}
        >
          {formatTimestamp(gmtCreate as string)}
        </Typography.Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'pullFromTeeStatus',
      width: '10%',
      // todo 待补充隐藏条件
      hide: true,
      render: (status: string, record: API.NodeResultsVO) => {
        if (record.computeMode === 'MPC' || status === '') {
          return '-';
        } else if (status === ResultTableState.SUCCESS) {
          return <Badge status="success" text="获取成功" />;
        } else if (status === ResultTableState.FAILED) {
          return <Badge status="error" text="获取失败" />;
        } else if (status === ResultTableState.RUNNING) {
          return <Badge status="processing" text="获取中" />;
        }
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: '15%',
      render: (_: string, record: API.NodeResultsVO) => renderButtons(record),
    },
  ];

  const renderColumns = () => {
    let newColumns = columns;
    if (ownerId && ownerId === 'tee') {
      newColumns = columns.filter(
        (item) => item.dataIndex !== 'action' && item.dataIndex !== 'pullFromTeeStatus',
      );
    }
    if (isAutonomy) {
      newColumns = columns.filter((item) => item.dataIndex !== 'pullFromTeeStatus');
    }
    if (!isAutonomy) {
      newColumns = columns.filter((item) => item.dataIndex !== 'nodeName');
    }
    return newColumns;
  };

  useEffect(() => {
    const flag = viewInstance.resultTableList.filter(
      (item) => item?.pullFromTeeStatus === ResultTableState.RUNNING,
    );

    if (flag.length) {
      clearTimeout(viewInstance.resultListTimer);
      viewInstance.resultListTimer = setTimeout(() => {
        viewInstance.getResultTableList('', true);
      }, 2000);
    } else {
      clearTimeout(viewInstance.resultListTimer);
    }
  }, [viewInstance.resultTableList]);

  return (
    <div className={styles.main}>
      <div className={styles.toolbar}>
        <div style={{ width: 220 }}>
          <Input
            defaultValue={parse(window.location.search).resultName || ''}
            placeholder="搜索结果名称"
            onChange={viewInstance.searchResult}
            suffix={
              <SearchOutlined
                style={{
                  color: '#aaa',
                }}
              />
            }
          />
        </div>
        {/* TODO 暂时隐藏  */}
        {/* <Button onClick={viewInstance.showModalDrawer}>批量删除</Button> */}
      </div>
      <div className={styles.content}>
        <Table
          loading={viewInstance.loading}
          dataSource={viewInstance.resultTableList}
          sortDirections={['descend', 'ascend']}
          columns={renderColumns()}
          onChange={(
            pagination,
            filters: Record<string, FilterValue | null>,
            sorter,
          ) => {
            viewInstance.typeFilter(filters, sorter as SorterResult<API.NodeResultsVO>);
          }}
          pagination={{
            total: viewInstance.totalNum || 1,
            current: viewInstance.pageNumber,
            pageSize: viewInstance.pageSize,
            onChange: (page, pageSize) => {
              viewInstance.pageNumber = page;
              viewInstance.pageSize = pageSize;
            },
          }}
          rowKey={(record) => `${record.domainDataId}_${record.nodeId}`}
        />
      </div>
      <ResultDetailsDrawer />
      <BatchDeleteModal
        open={viewInstance.showModal}
        onClose={viewInstance.closeModalDrawer}
      />
    </div>
  );
};

export class ResultManagerView extends Model {
  modalManager = getModel(DefaultModalManager);

  onViewUnMount(): void {
    this.modalManager.closeAllModals();
  }

  resultTableList: API.NodeResultsVO[] = [];

  resultTableListDisplay: API.NodeResultsVO[] = [];

  search = '';

  typesFilter: string[] = [];

  nodeNamesFilter: string[] | null = null;

  sortRule: string | null = 'descend';

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  loading = false;

  searchDebounce: number | undefined = undefined;

  resultManagerService = getModel(ResultManagerService);

  modalManager = getModel(DefaultModalManager);

  resultListTimer: ReturnType<typeof setTimeout> | undefined;

  showModal = false;

  onViewMount() {
    const { search } = window.location;
    const { resultName, ownerId } = parse(search);
    this.search = (resultName as string) || '';
    const isAutonomy = hasAccess({ type: [Platform.AUTONOMY] });
    if (ownerId) {
      isAutonomy && this.resultManagerService.getAutonomyNodeList();
      this.getResultTableList();
    }
  }

  async getResultTableList(nodeId?: string, isLoading?: boolean) {
    if (isLoading) {
      this.loading = false;
    } else {
      this.loading = true;
    }
    const { search } = window.location;
    const { ownerId } = parse(search);
    const currentOwnerId = nodeId ? nodeId : (ownerId as string);

    let sort = '';
    switch (this.sortRule) {
      case 'ascend':
        sort = 'ascending';
        break;
      case 'descend':
        sort = 'descending';
        break;
      default:
        sort = '';
    }
    const list = await this.resultManagerService.getResultList(
      currentOwnerId || '',
      this.pageNumber,
      this.pageSize,
      this.search,
      this.typesFilter,
      sort,
      this.nodeNamesFilter,
    );
    this.loading = false;
    this.totalNum = list?.totalNodeResultNums || 1;
    this.resultTableList =
      (list?.nodeAllResultsVOList || []).map((item) => ({
        ...(item?.nodeResultsVO || {}),
        nodeName: item.nodeName,
        nodeId: item.nodeId,
      })) || [];
    this.resultTableListDisplay = this.resultTableList;
  }

  searchResult = (e: ChangeEvent<HTMLInputElement>) => {
    history.replace({
      pathname: hasAccess({ type: [Platform.AUTONOMY] }) ? '/edge' : '/node',
      search: `ownerId=${parse(window.location.search)?.ownerId}&tab=result`,
    });
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(() => {
      this.pageNumber = 1;
      this.getResultTableList();
    }, 300) as unknown as number;
  };

  typeFilter = (
    tableInfo: Record<string, FilterValue | null>,
    sort: SorterResult<API.NodeResultsVO>,
  ) => {
    this.nodeNamesFilter = tableInfo?.nodeName
      ? (tableInfo?.nodeName as string[])
      : null;
    this.typesFilter = tableInfo.datatableType as string[];
    this.sortRule = sort?.order as string;
    this.getResultTableList();
  };

  showDrawer = (
    title: string,
    id: string,
    projectMode: ComputeMode,
    nodeId: string,
  ) => {
    this.modalManager.openModal(resultDetailsDrawer.id, { id, projectMode, nodeId });
  };

  download = async (tableInfo: API.NodeResultsVO, isAutonomy: boolean) => {
    const { ownerId } = parse(window.location.search);
    const currentDownloadNodeId = isAutonomy ? tableInfo.nodeId : ownerId;
    this.resultManagerService.download(currentDownloadNodeId || '', tableInfo);
  };

  copy = async (tableInfo: API.NodeResultsVO) => {
    console.log(tableInfo);
    //  补充接口
    // const {data} = await copy({
    //   nodeId,
    //   domainDataId: tableInfo.domainDataId,
    // })
    // if (data) {
    //   message.success(
    //     <>
    //       复制成功，可以到<Link to="/edge?tab=data-management">数据管理</Link >查看
    //     </>
    //   );
    // }
  };

  delete = async (tableInfo: API.NodeResultsVO) => {
    console.log(tableInfo);
    //  补充接口
    // const {data} = await copy({
    //   nodeId,
    //   domainDataId: tableInfo.domainDataId,
    // })
    // if (data) {
    //   message.success('删除结果成功');
    // }
  };

  showModalDrawer = () => {
    this.showModal = true;
  };

  closeModalDrawer = () => {
    this.showModal = false;
  };
}
