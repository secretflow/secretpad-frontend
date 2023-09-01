import { SearchOutlined } from '@ant-design/icons';
import type { RadioChangeEvent, TourProps } from 'antd';
import { message } from 'antd';
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
import type { ChangeEvent } from 'react';
import React, { useRef } from 'react';

import { confirmDelete } from '@/components/comfirm-delete';
import { DataTableAddContent } from '@/modules/data-table-add/data-table-add.view';
import { DatatableInfoService } from '@/modules/data-table-info/component/data-table-auth/data-table-auth.service';
import { DataTableAuth } from '@/modules/data-table-info/data-table-auth-drawer';
import { DataTableInfoDrawer } from '@/modules/data-table-info/data-table-info.view';
import {
  GuideTourKeys,
  GuideTourService,
} from '@/modules/guide-tour/guide-tour-service';
import { NodeService } from '@/modules/node';
import { deleteDatatable } from '@/services/secretpad/DatatableController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { DataTableAddContentBySource } from '../data-table-add/data-table-add-by-source.view';

import { DataManagerService } from './data-manager.service';
import styles from './index.less';

const embeddedSheets = ['alice.csv', 'bob.csv'];

export const DataManagerComponent: React.FC = () => {
  const viewInstance = useModel(DataManagerView);
  const guideTourService = useModel(GuideTourService);
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
      title: '表名称',
      dataIndex: 'datatableName',
      key: 'datatableName',
      render: (text: string, tableInfo: API.DatatableVO) => (
        <a onClick={() => viewInstance.openDataInfo(tableInfo)}>{text}</a>
      ),
    },
    {
      title: '数据表类型',
      dataIndex: 'type',
      key: 'type',
      // filters: [
      //   { text: '表', value: 'table' },
      //   { text: '模型', value: 'model' },
      //   { text: '规则', value: 'rule' },
      // ],
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status == 'Available') {
          return (
            <Space>
              <Badge key="green" color="green" text="" />
              可用
            </Space>
          );
        } else {
          return (
            <Space>
              <Badge key="red" color="red" text="" />
              不可用
            </Space>
          );
        }
      },
    },
    {
      title: '操作',
      key: 'action',
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
              授权管理
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
        );
      },
    });
  };

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
          columns={columns}
          loading={viewInstance.tableLoading}
          pagination={{
            total: viewInstance.totalNum || 1,
            current: viewInstance.pageNumber,
            pageSize: viewInstance.pageSize,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              viewInstance.pageNumber = page;
              viewInstance.pageSize = pageSize;
              viewInstance.getTableList();
            },
          }}
          rowKey={(record) => record.datatableId as string}
        />
      </div>
      {viewInstance.displayTableList.length > 0 && (
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

      {viewInstance.showAddDataDrawer &&
      viewInstance.currentNode.type === 'embedded' ? (
        <DataTableAddContent
          onClose={() => {
            viewInstance.getTableList();
            viewInstance.showAddDataDrawer = false;
          }}
          visible={viewInstance.showAddDataDrawer}
        />
      ) : (
        <DataTableAddContentBySource
          onClose={() => {
            viewInstance.getTableList();
          }}
          close={() => {
            viewInstance.showAddDataDrawer = false;
          }}
          visible={viewInstance.showAddDataDrawer}
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

  search = '';

  tableLoading = false;

  typesFilter: string[] = [];

  searchDebounce: number | undefined = undefined;

  showAuthDrawer = false;

  tableInfo: API.DatatableVO = {};

  showAddDataDrawer = false;

  showDatatableInfoDrawer = false;

  currentNode: API.NodeVO = {};

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

  async getTableList(nodeIdParam?: string) {
    this.tableLoading = true;
    const nodeId = nodeIdParam || this.nodeService.currentNode?.nodeId;
    const listData = await this.dataManagerService.listDataTables(
      nodeId || '',
      this.pageNumber,
      this.pageSize,
      this.statusFilter,
      this.search,
    );
    this.tableLoading = false;
    this.totalNum = listData?.totalDatatableNums || 1;
    this.tablesList = listData?.datatableVOList || [];
    this.displayTableList = this.tablesList;
  }

  addData() {
    this.showAddDataDrawer = true;
  }

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
  ) => {
    if (!this.nodeService.currentNode?.nodeId) return;
    const { status } = await deleteDatatable({
      nodeId: this.nodeService.currentNode?.nodeId,
      datatableId: dataId,
    });
    if (status && status.code !== 0) {
      messageApi.error(status.msg);
      return;
    }
    messageApi.success(`「${datatableName}」删除成功！`);
    this.getTableList();
  };

  dataFilter(e: RadioChangeEvent) {
    if (e.target.value === 'all') {
      this.statusFilter = '';
    } else if (e.target.value === 'Available') {
      this.statusFilter = 'Available';
    } else {
      this.statusFilter = 'UnAvailable';
    }
    this.getTableList();
  }

  searchTable(e: ChangeEvent<HTMLInputElement>) {
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.getTableList();
    }, 300) as unknown as number;
  }
}
