import { SearchOutlined } from '@ant-design/icons';
import { Input, Table, Typography } from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { parse } from 'query-string';
import type { ChangeEvent } from 'react';
import { history } from 'umi';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { formatTimestamp } from '@/modules/dag-result/utils';
import { NodeService } from '@/modules/node';
import {
  resultDetailsDrawer,
  ResultDetailsDrawer,
} from '@/modules/result-details/result-details-drawer';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import type { TableType } from './result-manager.protocol';
import { ResultManagerService, TableTypeMap } from './result-manager.service';

export const ResultManagerComponent = () => {
  const viewInstance = useModel(ResultManagerView);

  const { Link } = Typography;

  const columns = [
    {
      title: '结果ID',
      dataIndex: 'domainDataId',
      key: 'domainDataId',
      width: '20%',
      render: (text: string, record: API.NodeResultsVO) => {
        return (
          <Link
            onClick={() =>
              viewInstance.showDrawer(`「${text}」详情`, record.domainDataId as string)
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
      width: '15%',
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
      width: '20%',
      render: (sourceProject: string) => <span>{sourceProject}</span>,
    },
    {
      title: '所属训练流',
      dataIndex: 'trainFlow',
      width: '15%',
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
            tooltip: gmtCreate,
          }}
        >
          {formatTimestamp(gmtCreate as string)}
        </Typography.Text>
      ),
    },
  ];

  return (
    <div className={styles.main}>
      <div className={styles.toolbar}>
        <div style={{ flex: 1 }}></div>
        <div style={{ width: 220 }}>
          <Input
            defaultValue={parse(window.location.search).resultName || ''}
            placeholder="搜索表名/所属项目/训练流"
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
      </div>
      <div className={styles.content}>
        <Table
          loading={viewInstance.loading}
          dataSource={viewInstance.resultTableList}
          columns={columns}
          onChange={(pagination, filters: Record<string, FilterValue | null>, sorter) =>
            viewInstance.typeFilter(filters, sorter as SorterResult<API.NodeResultsVO>)
          }
          pagination={{
            total: viewInstance.totalNum || 1,
            current: viewInstance.pageNumber,
            pageSize: viewInstance.pageSize,
            onChange: (page, pageSize) => {
              viewInstance.pageNumber = page;
              viewInstance.pageSize = pageSize;
            },
          }}
          rowKey={(record) => record.domainDataId as string}
        />
      </div>
      <ResultDetailsDrawer />
    </div>
  );
};

export class ResultManagerView extends Model {
  resultTableList: API.NodeResultsVO[] = [];

  resultTableListDisplay: API.NodeResultsVO[] = [];

  search = '';

  typesFilter: string[] = [];

  sortRule: string | null = 'descend';

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  loading = false;

  searchDebounce: number | undefined = undefined;

  resultManagerService = getModel(ResultManagerService);

  nodeService = getModel(NodeService);

  modalManager = getModel(DefaultModalManager);

  onViewMount() {
    const { search } = window.location;
    const { resultName } = parse(search);
    this.search = (resultName as string) || '';
    if (this.nodeService.currentNode) {
      this.getResultTableList();
    }
    this.nodeService.eventEmitter.on((currentNode) => {
      this.getResultTableList(currentNode.nodeId);
    });
  }

  async getResultTableList(nodeId?: string) {
    this.loading = true;
    const currentNodeId = nodeId ? nodeId : this.nodeService.currentNode?.nodeId;

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
      currentNodeId || '',
      this.pageNumber,
      this.pageSize,
      this.search,
      this.typesFilter,
      sort,
    );
    this.loading = false;
    this.totalNum = list?.totalResultNums || 1;
    this.resultTableList = list?.nodeResultsVOList || [];
    this.resultTableListDisplay = this.resultTableList;
  }

  searchResult = (e: ChangeEvent<HTMLInputElement>) => {
    history.replace({
      pathname: '/node',
      search: `nodeId=${parse(window.location.search)?.nodeId}&tab=result`,
    });
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(() => {
      this.getResultTableList();
    }, 300) as unknown as number;
  };

  typeFilter = (
    tableInfo: Record<string, FilterValue | null>,
    sort: SorterResult<API.NodeResultsVO>,
  ) => {
    this.typesFilter = tableInfo.datatableType as string[];
    this.sortRule = sort?.order as string;
    this.getResultTableList();
  };

  showDrawer = (title: string, id: string) => {
    this.modalManager.openModal(resultDetailsDrawer.id, { id });
  };

  download = async (tableInfo: API.NodeResultsVO) => {
    this.resultManagerService.download(
      this.nodeService.currentNode?.nodeId || '',
      tableInfo,
    );
  };
}
