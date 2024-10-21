import { message } from 'antd';
import { parse } from 'query-string';

import { list, nodes, detail } from '@/services/secretpad/DataSourceController';
import { createDataTable } from '@/services/secretpad/DatatableController';
import { listNode } from '@/services/secretpad/InstController';
import { Model } from '@/util/valtio-helper';

export enum DataSourceType {
  OSS = 'OSS',
  HTTP = 'HTTP',
  ODPS = 'ODPS',
  LOCAL = 'LOCAL',
  MYSQL = 'MYSQL',
}

type OptionType = {
  label: string;
  value: string;
};

type Structure = {
  featureName: string;
  featureType: string;
  featureDescription: string;
};

type AddDataSheetValue = {
  dataSource: string;
  address: string;
  tableName: string;
  tableDesc: string;
  features: Structure[];
  odpsSheetName?: string;
  datasourceType: string;
  datasourceName: string;
  nodeIds: string[];
  partition: [{ name: string }];
  nullStrs: string[];
};

type AddDataSheetParams = AddDataSheetValue & {
  ownerId: string;
  type: DataSourceType;
};

// 本地数据源 ID
const DEFAULT_DATA_SOURCE = 'default-data-source';

export class AddDataSheetService extends Model {
  submitDisabled = true;

  /** 数据源列表 */
  dataSourceList: API.DatasourceListInfoAggregate[] = [
    {
      name: '本地数据源',
      datasourceId: 'default-data-source',
      type: DataSourceType.LOCAL,
    },
  ];

  nodeNameOptions: OptionType[] = [];

  dataSourceOptions: OptionType[] = [];

  addDataSheetLoading = false;

  odpsProjectName = 'alifin_bikey.';

  /** 获取ODPS数据源详情 */
  queryOdpsSourceDetail = async (params: API.DatasourceDetailRequest) => {
    const { data, status } = await detail(params);
    if (data && status && status.code === 0) {
      this.odpsProjectName = data?.info?.project || '';
    }
  };

  /** 获取数据源列表 */
  queryDataSourceList = async (ownerId: string) => {
    const { data, status } = await list({
      ownerId: ownerId,
      types: [
        DataSourceType.OSS,
        DataSourceType.HTTP,
        DataSourceType.ODPS,
        DataSourceType.MYSQL,
      ],
      page: 1,
      size: 1000,
      status: '',
      name: '',
    });
    if (data && status && status.code === 0) {
      this.dataSourceList = [
        {
          name: '本地数据源',
          datasourceId: DEFAULT_DATA_SOURCE,
          type: DataSourceType.LOCAL,
        },
        ...(data?.infos?.filter((item) => {
          const nodes = item?.nodes || [];
          return nodes.some((node) => node.status === 'Available');
        }) || []),
      ];
    }
    this.dataSourceOptions = this.dataSourceList.map((item) => ({
      label: item.name!,
      value: item.datasourceId!,
    }));
  };

  /** 获取数据源所属节点列表 */
  queryNodeNameList = async (ownerId: string, datasourceId: string) => {
    // 如果是本地数据源, 不需要选择所属节点，默认数据上传到机构的主节点上
    if (datasourceId === DEFAULT_DATA_SOURCE) {
      /** AUTONOMY 模式下获取机构下所有节点列表 */
      const { status, data } = await listNode();
      if (status && status.code === 0) {
        this.nodeNameOptions =
          data
            ?.filter((item) => item.isMainNode)
            .map((item) => ({
              label: item.nodeName!,
              value: item.nodeId!,
            })) || [];
      } else {
        this.nodeNameOptions = [];
        message.error(status?.msg);
      }
    } else {
      const { data, status } = await nodes({
        ownerId,
        datasourceId,
      });
      if (status && status.code === 0) {
        this.nodeNameOptions = (data?.nodes || [])
          .filter((item) => item.status === 'Available')
          .map((item) => ({
            label: item.nodeName!,
            value: item.nodeId!,
          }));
      } else {
        this.nodeNameOptions = [];
        message.error(status?.msg);
      }
    }
  };

  addDataSheet = async (value: AddDataSheetValue, type: DataSourceType) => {
    const params = {
      ...value,
      ownerId: parse(window.location.search)?.ownerId as string,
      type,
    };
    switch (type) {
      case DataSourceType.HTTP:
        return this.addHttpData(params);
      case DataSourceType.OSS:
        return this.addOssData(params);
      case DataSourceType.ODPS:
        return this.addOdpsData(params);
      case DataSourceType.MYSQL:
        return this.addMysqlData(params);
      default:
        return { status: {} };
    }
  };

  addMysqlData = async (value: AddDataSheetParams) => {
    const params = {
      ownerId: value.ownerId,
      nodeIds: value.nodeIds,
      datatableName: value.tableName,
      datasourceId: value.dataSource,
      type: value.type,
      desc: value.tableDesc,
      relativeUri: value.address,
      columns: value.features.map((item: Structure) => ({
        colName: item.featureName,
        colType: item.featureType,
        colComment: item.featureDescription || '',
      })),
      datasourceType: value.datasourceType,
      datasourceName: value.datasourceName,
      nullStrs: value.nullStrs,
    };
    return await createDataTable(params);
  };

  addOdpsData = async (value: AddDataSheetParams) => {
    const params = {
      nodeIds: value.nodeIds,
      datasourceName: value.datasourceName,
      datasourceId: value.dataSource,
      type: value.type,
      relativeUri: value.odpsSheetName,
      columns: value.features.map((item: Structure) => ({
        colName: item.featureName,
        colType: item.featureType,
        colComment: item.featureDescription,
      })),
      partition: {
        type: 'odps',
        fields: value.partition.reduce(
          (
            prev: { name: string; type: string; comment: string }[],
            cur: { name?: string },
          ) => {
            if (cur.name) {
              const selected = value.features.find((f) => f.featureName === cur.name);
              if (selected)
                prev.push({
                  name: selected.featureName,
                  type: selected.featureType,
                  comment: selected?.featureDescription,
                });
            }

            return prev;
          },
          [],
        ),
      },
      datatableName: value.tableName,
      datasourceType: value.datasourceType,
      desc: value.tableDesc,
      ownerId: value.ownerId,
      nullStrs: value.nullStrs,
    };
    return await createDataTable(params);
  };

  addHttpData = async (value: AddDataSheetParams) => {
    const params = {
      datasourceType: value.datasourceType,
      datasourceId: 'http-data-source',
      datasourceName: 'http-data-source',
      datatableName: value.tableName,
      ownerId: value.ownerId,
      nodeIds: value.nodeIds,
      type: value.type,
      desc: value.tableDesc,
      relativeUri: value.address,
      columns: value.features.map((item: Structure) => ({
        colName: item.featureName,
        colType: item.featureType,
        colComment: item.featureDescription,
      })),
    };
    return await createDataTable(params);
  };

  addOssData = async (value: AddDataSheetParams) => {
    const params = {
      ownerId: value.ownerId,
      nodeIds: value.nodeIds,
      datatableName: value.tableName,
      datasourceId: value.dataSource,
      type: value.type,
      desc: value.tableDesc,
      relativeUri: value.address,
      columns: value.features.map((item: Structure) => ({
        colName: item.featureName,
        colType: item.featureType,
        colComment: item.featureDescription || '',
      })),
      datasourceType: value.datasourceType,
      datasourceName: value.datasourceName,
      nullStrs: value.nullStrs,
    };
    return await createDataTable(params);
  };
}
