import { parse } from 'query-string';

import { createFeatureDatasource } from '@/services/secretpad/FeatureDatasourceController';
import { createDataTable } from '@/services/secretpad/DatatableController';
import { list } from '@/services/secretpad/DataSourceController';
import { Model } from '@/util/valtio-helper';

export enum DataSourceType {
  OSS = 'OSS',
  HTTP = 'HTTP',
  ODPS = 'ODPS',
  LOCAL = 'LOCAL',
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
};

type AddDataSheetParams = AddDataSheetValue & {
  nodeId: string;
  type: DataSourceType;
};

export class AddDataSheetService extends Model {
  submitDisabled = true;

  /** 数据源列表 */
  dataSourceList: API.DatasourceListInfo[] = [
    {
      name: '本地数据源',
      datasourceId: 'default-data-source',
      type: DataSourceType.LOCAL,
    },
  ];

  dataSourceOptions: OptionType[] = [];

  addDataSheetLoading = false;

  /** 获取数据源列表 */
  queryDataSourceList = async (nodeId: string) => {
    const { data, status } = await list({
      nodeId,
      types: [DataSourceType.OSS, DataSourceType.HTTP],
      page: 1,
      size: 1000,
      status: '',
      name: '',
    });
    if (data && status && status.code === 0) {
      this.dataSourceList = [
        {
          name: '本地数据源',
          datasourceId: 'default-data-source',
          type: DataSourceType.LOCAL,
        },
        // {
        //   name: 'oss数据源',
        //   datasourceId: 'alice-oss-datasource',
        //   type: 'OSS',
        // },
        ...(data?.infos?.filter((item) => item.status === 'Available') || []),
      ];
    }
    this.dataSourceOptions = this.dataSourceList.map((item) => ({
      label: item.name!,
      value: item.datasourceId!,
    }));
  };

  addDataSheet = async (value: AddDataSheetValue, type: DataSourceType) => {
    const params = {
      ...value,
      nodeId: parse(window.location.search)?.nodeId as string,
      type,
    };
    switch (type) {
      case DataSourceType.HTTP:
        return this.addHttpData(params);
      case DataSourceType.OSS:
        return this.addOssData(params);
      default:
        return { status: {} };
    }
  };

  addHttpData = async (value: AddDataSheetParams) => {
    const params = {
      featureTableName: value.tableName,
      nodeId: value.nodeId,
      type: value.type,
      desc: value.tableDesc,
      url: value.address,
      columns: value.features.map((item: Structure) => ({
        colName: item.featureName,
        colType: item.featureType,
        colComment: item.featureDescription,
      })),
    };
    return await createFeatureDatasource(params);
  };

  addOssData = async (value: AddDataSheetParams) => {
    const params = {
      nodeId: value.nodeId,
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
    };
    return await createDataTable(params);
  };
}
