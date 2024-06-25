import { SearchOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { RadioChangeEvent, TourProps } from 'antd';
import { message, Tag } from 'antd';
import {
  Button,
  Radio,
  Input,
  Tour,
  Table,
  Space,
  Popover,
  Badge,
  Typography,
  Tooltip,
  Empty,
} from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { FilterValue } from 'antd/es/table/interface';
import { parse } from 'query-string';
import type { ChangeEvent } from 'react';
import React, { useEffect, useRef } from 'react';

import { confirmDelete } from '@/components/comfirm-delete';
import { EdgeAuthWrapper } from '@/components/edge-wrapper-auth';
import { Platform, hasAccess } from '@/components/platform-wrapper';
import { DataAddDrawer } from '@/modules/data-table-add/add-data/add-data.view';
import { DatatableInfoService } from '@/modules/data-table-info/component/data-table-auth/data-table-auth.service';
import { DataTableAuth } from '@/modules/data-table-info/data-table-auth-drawer';
import { DataTableInfoDrawer } from '@/modules/data-table-info/data-table-info.view';
import {
  GuideTourKeys,
  GuideTourService,
} from '@/modules/guide-tour/guide-tour-service';
import { NodeService } from '@/modules/node';
import {
  deleteDatatable,
  pushDatatableToTeeNode,
  getDatatable,
} from '@/services/secretpad/DatatableController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { LoginService } from '../login/login.service';

import {
  DataManagerService,
  DataSourceType,
  UploadStatus,
} from './data-manager.service';
import styles from './index.less';

const embeddedSheets = ['alice.csv', 'bob.csv'];

export const DataManagerComponent: React.FC = () => {
  const viewInstance = useModel(DataManagerView);
  const guideTourService = useModel(GuideTourService);
  const loginService = useModel(LoginService);
  const [messageApi, contextHolder] = message.useMessage();
  const ref1 = useRef(null);
  const steps: TourProps['steps'] = [
    {
      title: '在这里可以把节点数据授权到项目哦',
      description: '',
      nextButtonProps: {
        children: <div>知道了</div>,
      },
      target: () => ref1.current,
    },
  ];

  const columns = [
    {
      title: '数据表名',
      dataIndex: 'datatableName',
      key: 'datatableName',
      ellipsis: true,
      width: '20%',
      render: (text: string, tableInfo: API.DatatableVO) => (
        <Tooltip title={text}>
          <a onClick={() => viewInstance.openDataInfo(tableInfo)}>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: '数据源类型',
      dataIndex: 'datasourceType',
      key: 'datasourceType',
      width: '10%',
      filters: [
        { text: 'OSS', value: DataSourceType.OSS },
        { text: 'HTTP', value: DataSourceType.HTTP },
        { text: 'LOCAL', value: DataSourceType.LOCAL },
      ],
    },
    {
      title: '已授权项目',
      dataIndex: 'authProjects',
      key: 'authProjects',
      render: (authProjects: API.AuthProjectVO[]) => {
        const authProjectsFixed = authProjects || [];
        return (
          <div style={{ display: 'flex' }}>
            {(authProjectsFixed || [])
              .slice(0, 2)
              .map((i) => i.name)
              .join('、')}
            {authProjectsFixed.length ? ',' : ''}共
            <Popover
              placement="right"
              title="已授权项目"
              content={
                <div className={styles.authProjectListPopover}>
                  {(() => {
                    const projects = authProjectsFixed.map((i) => (
                      <div key={i.name} className={styles.authProjectListPopoverItem}>
                        {i.name}
                      </div>
                    ));
                    return projects.length > 0 ? (
                      projects
                    ) : (
                      <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    );
                  })()}
                </div>
              }
              trigger="hover"
            >
              <a>{authProjectsFixed.length}</a>
            </Popover>
            个项目
          </div>
        );
      },
    },
    {
      title: (
        <Space>
          <div className={styles.uploadText}>状态</div>
          <Tooltip title="数据表状态可能展示不准确,请点击刷新后查看">
            <InfoCircleOutlined className={styles.uploadIcon} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'status',
      key: 'status',
      width: '14%',
      render: (status: string, record: API.DatatableVO) => {
        return (
          <>
            {status === 'Available' ? (
              <Badge key="green" color="green" text="可用" />
            ) : (
              <Badge key="red" color="red" text="不可用" />
            )}
            <Button
              type="link"
              icon={<ReloadOutlined />}
              onClick={() => {
                viewInstance.refreshTableStatus(record);
              }}
            >
              刷新
            </Button>
          </>
        );
      },
    },
    {
      title: (
        <div className={styles.uploadTitle}>
          <div className={styles.uploadText}>加密上传</div>
          <Tooltip title="加密上传到TEE，若数据表内容修改可重新上传">
            <InfoCircleOutlined className={styles.uploadIcon} />
          </Tooltip>
        </div>
      ),
      key: 'pushToTeeStatus',
      dataIndex: 'pushToTeeStatus',
      width: '15%',
      render: (status: string, record: API.DatatableVO) => {
        if (
          record.datasourceType === DataSourceType.HTTP ||
          record.datasourceType === DataSourceType.OSS
        )
          return '-';
        if (!status || status === '') {
          return (
            <Button
              type="link"
              className={styles.uploadBtn}
              onClick={() => viewInstance.encryptedUpload(record)}
            >
              上传
            </Button>
          );
        } else if (status === UploadStatus.RUNNING) {
          return <div className={styles.uploadLoading}>上传中...</div>;
        } else if (status === UploadStatus.SUCCESS) {
          return (
            <div className={styles.uploadTag}>
              <Tag color="success">成功</Tag>
              <Button type="link" onClick={() => viewInstance.encryptedUpload(record)}>
                重新上传
              </Button>
            </div>
          );
        } else if (status === UploadStatus.FAILED) {
          return (
            <div className={styles.uploadTag}>
              <Tooltip title={record.pushToTeeErrMsg}>
                <Tag color="error">失败</Tag>
              </Tooltip>
              <Button type="link" onClick={() => viewInstance.encryptedUpload(record)}>
                重新上传
              </Button>
            </div>
          );
        } else if (record.status !== 'Available') {
          return '-';
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (
        tableInfo: API.DatatableVO,
        tableInfo2: API.DatatableVO,
        index: number,
      ) => {
        const extendProps: any = {};
        if (index === 0) {
          extendProps['ref'] = ref1;
        }
        const authProjectsFixed = tableInfo.authProjects || [];
        return (
          <Space>
            <Typography.Link
              {...extendProps}
              onClick={() => viewInstance.openAuth(tableInfo)}
            >
              {'授权管理'}
            </Typography.Link>
            {!embeddedSheets.includes(tableInfo.datatableName || '') && (
              <Tooltip
                title={
                  authProjectsFixed.length > 0 ? '已授权到项目中的数据无法删除' : ''
                }
              >
                <Button
                  type="link"
                  disabled={authProjectsFixed.length > 0}
                  onClick={() => handleDelete(tableInfo)}
                >
                  删除
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const handleDelete = (record: API.DatatableVO) => {
    confirmDelete({
      name: record.datatableName || '',
      description: '',
      onOk: () => {
        viewInstance.deleteData(
          record.datatableName || '',
          record.datatableId || '',
          messageApi,
          record.type,
        );
      },
    });
  };

  useEffect(() => {
    const flag = viewInstance.tablesList.filter(
      (item) => item.pushToTeeStatus === UploadStatus.RUNNING,
    );

    if (flag.length) {
      clearTimeout(viewInstance.tableListTimeOut);
      viewInstance.tableListTimeOut = setTimeout(() => {
        viewInstance.getTableList('', true);
      }, 2000);
    } else {
      clearTimeout(viewInstance.tableListTimeOut);
    }
  }, [viewInstance.tablesList]);

  return (
    <div className={styles.main}>
      <div className={styles.toolbar}>
        <div style={{ marginRight: 12, width: 220 }}>
          <Input
            placeholder="搜索表名"
            onChange={(e) => viewInstance.searchTable(e)}
            suffix={
              <SearchOutlined
                style={{
                  color: '#aaa',
                }}
              />
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <Radio.Group defaultValue="all" onChange={(e) => viewInstance.dataFilter(e)}>
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="Available">可用</Radio.Button>
            <Radio.Button value="UnAvailable">不可用</Radio.Button>
          </Radio.Group>
        </div>
        <div>
          <Button type="primary" onClick={() => viewInstance.addData()}>
            添加数据
          </Button>
        </div>
      </div>
      <div className={styles.content}>
        <Table
          dataSource={viewInstance.displayTableList}
          // tee节点 / MPC部署模式 / p2p部署模式 不展示加密上传
          columns={
            viewInstance.currentNode.nodeId === 'tee' ||
            loginService.userInfo?.deployMode === 'MPC' ||
            hasAccess({ type: [Platform.AUTONOMY] })
              ? columns.filter((item) => item.key !== 'pushToTeeStatus')
              : columns
          }
          loading={viewInstance.tableLoading}
          onChange={(pagination, filters, sorter) => {
            viewInstance.typeFilters = filters?.datasourceType as FilterValue;
            viewInstance.getTableList();
          }}
          pagination={{
            total: viewInstance.totalNum || 1,
            current: viewInstance.pageNumber,
            pageSize: viewInstance.pageSize,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              viewInstance.pageNumber = page;
              viewInstance.pageSize = pageSize;
              // viewInstance.getTableList();
            },
            size: 'default',
          }}
          rowKey={(record) => record.datatableId as string}
          size="small"
        />
      </div>
      {viewInstance.displayTableList.length > 0 && (
        <EdgeAuthWrapper>
          <Tour
            open={!guideTourService.DatatableAuthTour}
            onClose={() => viewInstance.closeGuideTour()}
            mask={false}
            type="primary"
            zIndex={100000000}
            steps={steps}
            placement="topRight"
            rootClassName="dataauth-tour"
          />
        </EdgeAuthWrapper>
      )}
      {viewInstance.showAuthDrawer && (
        <DataTableAuth
          close={() => {
            viewInstance.showAuthDrawer = false;
          }}
          visible={viewInstance.showAuthDrawer}
          data={viewInstance.tableInfo}
        />
      )}

      {viewInstance.showDatatableInfoDrawer && (
        <DataTableInfoDrawer
          close={() => {
            viewInstance.showDatatableInfoDrawer = false;
          }}
          visible={viewInstance.showDatatableInfoDrawer}
          data={{
            tableInfo: viewInstance.tableInfo,
            node: viewInstance.nodeService.currentNode as API.NodeVO,
          }}
        />
      )}

      {viewInstance.showDataAddDrawer && (
        <DataAddDrawer
          onClose={() => {
            viewInstance.getTableList();
            viewInstance.showDataAddDrawer = false;
          }}
          visible={viewInstance.showDataAddDrawer}
        />
      )}
      {contextHolder}
    </div>
  );
};

export class DataManagerView extends Model {
  tablesList: API.DatatableVO[] = [];

  displayTableList: API.DatatableVO[] = [];

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  statusFilter = '';

  typeFilters: FilterValue | null = null;

  search = '';

  tableLoading = false;

  typesFilter: string[] = [];

  searchDebounce: number | undefined = undefined;

  showAuthDrawer = false;

  tableInfo: API.DatatableVO = {};

  showDatatableInfoDrawer = false;

  showDataAddDrawer = false;

  currentNode: API.NodeVO = {};

  tableListTimeOut: NodeJS.Timeout | undefined;

  guideTourService = getModel(GuideTourService);
  dataManagerService = getModel(DataManagerService);
  nodeService = getModel(NodeService);
  datatableInfoService = getModel(DatatableInfoService);

  onViewMount() {
    if (this.nodeService.currentNode) {
      this.getTableList(this.nodeService.currentNode.nodeId as string);
      this.currentNode = this.nodeService.currentNode;
    }
    this.nodeService.eventEmitter.on((currentNode) => {
      this.getTableList(currentNode.nodeId);
      this.currentNode = currentNode;
    });
    this.datatableInfoService.eventEmitter.on(() => {
      this.getTableList();
    });
  }

  closeGuideTour() {
    this.guideTourService.finishTour(GuideTourKeys.DatatableAuthTour);
  }

  async getTableList(nodeIdParam?: string, isUpload?: boolean) {
    if (isUpload) {
      this.tableLoading = false;
    } else {
      this.tableLoading = true;
    }
    const nodeId = nodeIdParam || this.nodeService.currentNode?.nodeId;
    const listData = await this.dataManagerService.listDataTables(
      nodeId || '',
      this.pageNumber,
      this.pageSize,
      this.statusFilter,
      this.search,
      this.typeFilters,
    );

    this.tableLoading = false;
    this.totalNum = listData?.totalDatatableNums || 1;
    this.tablesList = listData?.datatableVOList || [];

    this.displayTableList = this.tablesList;
  }

  addData = () => {
    this.showDataAddDrawer = true;
  };

  openDataInfo(tableInfo: API.DatatableVO) {
    this.tableInfo = tableInfo;
    this.showDatatableInfoDrawer = true;
  }

  openAuth(tableInfo: API.DatatableVO) {
    this.showAuthDrawer = true;
    this.tableInfo = tableInfo;
  }

  deleteData = async (
    datatableName: string,
    dataId: string,
    messageApi: MessageInstance,
    type: string,
  ) => {
    if (!this.nodeService.currentNode?.nodeId) return;
    const { status } = await deleteDatatable({
      nodeId: this.nodeService.currentNode?.nodeId,
      datatableId: dataId,
      type,
    });
    if (status && status.code !== 0) {
      messageApi.error(status.msg);
      return;
    }
    messageApi.success(`「${datatableName}」删除成功！`);
    this.getTableList();
  };

  encryptedUpload = async (record: API.DatatableVO) => {
    const { datatableId } = record;

    const { search } = window.location;
    const { nodeId } = parse(search);

    try {
      const { status } = await pushDatatableToTeeNode({
        nodeId: nodeId as string,
        datatableId,
      });

      if (status?.code === 0) {
        this.getTableList('', true);
      } else {
        message.error(status?.msg || '操作失败');
      }
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  dataFilter(e: RadioChangeEvent) {
    if (e.target.value === 'all') {
      this.statusFilter = '';
    } else if (e.target.value === 'Available') {
      this.statusFilter = 'Available';
    } else {
      this.statusFilter = 'UnAvailable';
    }
    this.getTableList('', true);
  }

  searchTable(e: ChangeEvent<HTMLInputElement>) {
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.getTableList();
    }, 300) as unknown as number;
  }

  refreshTableStatus = async (record: API.DatatableVO) => {
    try {
      const { status, data } = await getDatatable({
        datatableId: record.datatableId,
        nodeId: this.currentNode.nodeId,
        type: record.type,
      });
      if (status?.code === 0) {
        message.success('数据状态刷新成功');
        // TODO: 这里服务端列表状态和这个状态暂时做不到同步，需要手动修改列表状态
        // this.getTableList();
        const newStatus = data?.status;
        const newList = this.displayTableList.map((item) => {
          if (item.datatableId === record.datatableId) {
            return {
              ...item,
              status: newStatus,
            };
          }
          return item;
        });
        this.displayTableList = newList;
      } else {
        message.error('数据状态刷新失败');
      }
    } catch (error) {
      message.error((error as Error).message);
    }
  };
}
