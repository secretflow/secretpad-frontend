import { SearchOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { Button, Input, Popover, Radio, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterValue } from 'antd/es/table/interface';
import { parse } from 'query-string';
import type { ChangeEvent } from 'react';
import { useLocation } from 'umi';

import { confirmDelete } from '@/components/comfirm-delete';
import { hasAccess, Platform } from '@/components/platform-wrapper';
import { list } from '@/services/secretpad/DataSourceController';
import { Model, getModel, useModel } from '@/util/valtio-helper';

import { CreateDataSourceModal } from './components/create-data-source';
import { DataSourceInfoDrawer } from './components/data-source-info';
import { NodeList } from './components/node-list';
import { DataSourceService, DataSourceType } from './data-source-list.service';
import styles from './index.less';

export const DataSourceListComponent = () => {
  const viewInstance = useModel(DataSourceView);
  const dataSourceService = useModel(DataSourceService);
  const isAutonomy = hasAccess({ type: [Platform.AUTONOMY] });

  const { search } = useLocation();
  const { ownerId } = parse(search);

  const handleDelete = (record: API.DatasourceListInfoAggregate) => {
    confirmDelete({
      name: record.name || '',
      description: '',
      onOk: async () => {
        await dataSourceService.deleteDataSource({
          datasourceId: record.datasourceId,
          ownerId: ownerId as string,
          type: record.type,
        });
        viewInstance.getDataSourceList();
      },
    });
  };

  const columns: ColumnsType<API.DatasourceListInfoAggregate> = [
    {
      title: '数据源名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '30%',
      render: (text: string, record: API.DatasourceListInfoAggregate) => (
        <Tooltip title={text}>
          <a
            onClick={() => {
              viewInstance.showDataSourceInfo(record);
            }}
          >
            {text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      filters: [
        { text: 'OSS', value: DataSourceType.OSS },
        { text: 'HTTP', value: DataSourceType.HTTP },
        { text: 'ODPS', value: DataSourceType.ODPS },
      ],
    },
    {
      title: '状态',
      dataIndex: 'nodes',
      key: 'nodes',
      width: isAutonomy ? '35%' : '20%',
      render: (nodes: API.DataSourceRelatedNode[]) => <NodeList nodeIds={nodes} />,
    },
    // {
    //   title: '创建时间',
    //   dataIndex: 'createTime',
    //   key: 'createTime',
    //   width: '20%',
    //   ellipsis: true,
    //   render: (createTime: string) => (
    //     <Typography.Text
    //       ellipsis={{
    //         tooltip: `${formatTimestamp(createTime)}`,
    //       }}
    //     >
    //       {formatTimestamp(createTime)}
    //     </Typography.Text>
    //   ),
    // },
    {
      title: '操作',
      dataIndex: 'action',
      width: '15%',
      render: (_: string, record: API.DatasourceListInfoAggregate) =>
        record.relatedDatas && record.relatedDatas?.length > 0 ? (
          <Popover
            placement="rightTop"
            title=""
            content={
              <div>
                暂不可删除，已绑定以下数据表：
                {record.relatedDatas?.map((item: string) => (
                  <div className={styles.datatableName} key={item}>
                    {item}
                  </div>
                ))}
              </div>
            }
          >
            <Button
              disabled={record.relatedDatas?.length > 0}
              type="link"
              style={{ paddingLeft: 0 }}
              onClick={() => {
                handleDelete(record);
              }}
            >
              删除
            </Button>
          </Popover>
        ) : (
          <Button
            disabled={
              record.type === DataSourceType.HTTP ||
              (record.relatedDatas && record.relatedDatas?.length > 0)
            }
            type="link"
            style={{ paddingLeft: 0 }}
            onClick={() => {
              handleDelete(record);
            }}
          >
            删除
          </Button>
        ),
    },
  ];
  return (
    <div className={styles.main}>
      <div className={styles.toolbar}>
        <Space>
          <div style={{ marginRight: 12, width: 220 }}>
            <Input
              placeholder="搜索数据源名称"
              onChange={(e) => {
                viewInstance.searchTable(e);
              }}
              suffix={
                <SearchOutlined
                  style={{
                    color: '#aaa',
                  }}
                />
              }
            />
          </div>
          {!isAutonomy && (
            <Radio.Group
              defaultValue="all"
              onChange={(e) => {
                viewInstance.dataFilter(e);
              }}
            >
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="Available">可用</Radio.Button>
              <Radio.Button value="UnAvailable">不可用</Radio.Button>
            </Radio.Group>
          )}
        </Space>
        <div>
          <Button type="primary" onClick={() => viewInstance.addDataSource()}>
            注册数据源
          </Button>
        </div>
      </div>
      <div className={styles.content}>
        <Table
          dataSource={viewInstance.dataSourceList}
          columns={columns}
          loading={viewInstance.tableLoading}
          onChange={(pagination, filters) => {
            viewInstance.typeFilters =
              filters?.type === null
                ? ([DataSourceType.OSS, DataSourceType.HTTP] as FilterValue)
                : filters?.type;
            viewInstance.getDataSourceList();
          }}
          pagination={{
            total: viewInstance.totalNum || 1,
            current: viewInstance.pageNumber,
            pageSize: viewInstance.pageSize,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              viewInstance.pageNumber = page;
              viewInstance.pageSize = pageSize;
            },
            size: 'default',
          }}
          rowKey={(record) => record.datasourceId as string}
          size="small"
        />
      </div>

      {viewInstance.showAddDataSourceDrawer && (
        <CreateDataSourceModal
          onClose={() => {
            viewInstance.getDataSourceList();
            viewInstance.showAddDataSourceDrawer = false;
          }}
          visible={viewInstance.showAddDataSourceDrawer}
        />
      )}
      {viewInstance.showDataSourceInfoDrawer && (
        <DataSourceInfoDrawer
          onClose={() => {
            viewInstance.getDataSourceList();
            viewInstance.showDataSourceInfoDrawer = false;
          }}
          visible={viewInstance.showDataSourceInfoDrawer}
          data={viewInstance.DataSourceData}
        />
      )}
    </div>
  );
};

export class DataSourceView extends Model {
  dataSourceList: API.DatasourceListInfoAggregate[] = [];

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  statusFilter = '';

  typeFilters: FilterValue | null = [
    DataSourceType.OSS,
    DataSourceType.HTTP,
    DataSourceType.ODPS,
  ];

  search = '';

  tableLoading = false;

  typesFilter: string[] = [];

  searchDebounce: number | undefined = undefined;

  showAddDataSourceDrawer = false;

  showDataSourceInfoDrawer = false;

  DataSourceData: API.DatasourceListInfoAggregate = {};

  currentNode: API.NodeVO = {};

  dataSourceService = getModel(DataSourceService);

  onViewMount() {
    this.getDataSourceList();
  }

  async getDataSourceList(isUpload?: boolean) {
    if (isUpload) {
      this.tableLoading = false;
    } else {
      this.tableLoading = true;
    }
    const { ownerId } = parse(window.location.search);
    const listData = await list({
      ownerId: (ownerId as string) || '',
      page: this.pageNumber,
      size: this.pageSize,
      status: this.statusFilter,
      name: this.search,
      types: this.typeFilters as string[],
    });

    this.tableLoading = false;
    this.totalNum = listData?.data?.total || 1;
    this.dataSourceList = listData?.data?.infos || [];
  }

  searchTable(e: ChangeEvent<HTMLInputElement>) {
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.getDataSourceList();
    }, 300) as unknown as number;
  }

  dataFilter(e: RadioChangeEvent) {
    if (e.target.value === 'all') {
      this.statusFilter = '';
    } else if (e.target.value === 'Available') {
      this.statusFilter = 'Available';
    } else {
      this.statusFilter = 'UnAvailable';
    }
    this.getDataSourceList(true);
  }

  addDataSource() {
    this.showAddDataSourceDrawer = true;
  }

  showDataSourceInfo(data: API.DatasourceListInfoAggregate) {
    this.showDataSourceInfoDrawer = true;
    this.DataSourceData = data;
  }
}
