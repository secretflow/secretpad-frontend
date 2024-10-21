import { CloseOutlined } from '@ant-design/icons';
import { Descriptions, Drawer, Space, Spin, Tag } from 'antd';
import { parse } from 'query-string';
import React from 'react';
import { useLocation } from 'umi';

import { EllipsisMiddle } from '@/components/text-ellipsis.tsx';
import {
  DataSourceService,
  DataSourceStatusText,
  DataSourceType,
} from '@/modules/data-source-list/data-source-list.service';
import { HttpQueryExample } from '@/modules/data-table-add/component/httpQueryExample';
import { useModel } from '@/util/valtio-helper';

import styles from './index.less';

const DataSourceOSSTypeInfo = (props: { data: API.DatasourceDetailAggregateVO }) => {
  const { data } = props;

  return (
    <div>
      <Descriptions column={1}>
        <Descriptions.Item label="数据源类型">{data.type}</Descriptions.Item>
        <Descriptions.Item label="endpoint名称">
          {data.info?.endpoint}
        </Descriptions.Item>
        <Descriptions.Item label="AccessKeyID">{data?.info?.ak}</Descriptions.Item>
        <Descriptions.Item label="AccessKeySecret">******</Descriptions.Item>
        <Descriptions.Item label="virtualhost">
          {data?.info?.virtualhost ? '开' : '关'}
        </Descriptions.Item>
        <Descriptions.Item label="bucket">{data?.info?.bucket}</Descriptions.Item>
        <Descriptions.Item label="预设路径">
          {data?.info?.prefix || '--'}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

const DataSourceHTTPTypeInfo = (props: { data: API.DatasourceDetailAggregateVO }) => {
  const { data } = props;

  return (
    <div>
      <Descriptions column={1}>
        <Descriptions.Item label="数据源类型">{data.type}</Descriptions.Item>
        {/* {data.info?.searchKey} */}
        {/* <Descriptions.Item label="searchKey">--</Descriptions.Item> */}
      </Descriptions>
      <HttpQueryExample />
    </div>
  );
};

const DataSourceODPSTypeInfo = (props: { data: API.DatasourceDetailAggregateVO }) => {
  const { data } = props;

  return (
    <div>
      <Descriptions column={1}>
        <Descriptions.Item label="数据源类型">{data.type}</Descriptions.Item>
        <Descriptions.Item label="ODPS Project名称">
          {data?.info?.project || '--'}
        </Descriptions.Item>
        <Descriptions.Item label="AccessKeyID">
          {data?.info?.accessId || '--'}
        </Descriptions.Item>
        <Descriptions.Item label="AccessKeySecret">******</Descriptions.Item>
      </Descriptions>
    </div>
  );
};

const DataSourceMYSQLTypeInfo = (props: { data: API.DatasourceDetailAggregateVO }) => {
  const { data } = props;

  return (
    <div>
      <Descriptions column={1}>
        <Descriptions.Item label="数据源类型">{data.type}</Descriptions.Item>
        <Descriptions.Item label="endpoint名称">
          {data.info?.endpoint || '--'}
        </Descriptions.Item>
        <Descriptions.Item label="user">{data?.info?.user || '--'}</Descriptions.Item>
        <Descriptions.Item label="password">******</Descriptions.Item>
        <Descriptions.Item label="database">
          {data?.info?.database || '--'}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

const DataSourceInfoRender = (props: { item: API.DatasourceDetailAggregateVO }) => {
  const { item } = props;
  if (!item.type) return <>{'--'}</>;
  const ContentMap = React.useMemo(
    () => ({
      [DataSourceType.OSS]: <DataSourceOSSTypeInfo data={item} />,
      [DataSourceType.HTTP]: <DataSourceHTTPTypeInfo data={item} />,
      [DataSourceType.ODPS]: <DataSourceODPSTypeInfo data={item} />,
      [DataSourceType.MYSQL]: <DataSourceMYSQLTypeInfo data={item} />,
    }),
    [item],
  );
  return ContentMap[item.type as DataSourceType];
};

export const DataSourceInfoDrawer: React.FC<{
  onClose: () => void;
  visible: boolean;
  data: API.DatasourceListInfoAggregate;
}> = ({ visible, onClose, data }) => {
  const service = useModel(DataSourceService);
  const { search } = useLocation();
  const { ownerId } = parse(search);

  React.useEffect(() => {
    if (!visible) {
      return;
    }
    service.getDataSourceDetail({
      ownerId: ownerId as string,
      datasourceId: data.datasourceId,
      type: data.type,
    });
  }, [visible]);

  return (
    <Drawer
      title={
        <div style={{ width: 400 }}>
          <EllipsisMiddle suffixCount={12}>{`「 ${data.name} 」 详情`}</EllipsisMiddle>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      closable={false}
      width={560}
      className={styles.dataSourceInfoDrawer}
      extra={
        <CloseOutlined
          style={{ fontSize: 12 }}
          onClick={() => {
            onClose();
          }}
        />
      }
    >
      <Spin spinning={service.dataSourceDetailLoading}>
        <DataSourceInfoRender item={service.dataSourceDetail} />
        <div className={styles.nodeTitle}>节点连接配置</div>
        <div className={styles.nodeContent}>
          <Space direction="vertical">
            {(service.dataSourceDetail.nodes || []).map((item, index) => (
              <Space key={item.nodeId}>
                <span className={styles.nodeNumber}>{`节点${index + 1}:`}</span>
                <span className={styles.nodeName}>{item?.nodeName}</span>
                <Tag
                  bordered={false}
                  color={
                    DataSourceStatusText[
                      item.status as keyof typeof DataSourceStatusText
                    ]?.color
                  }
                >
                  {
                    DataSourceStatusText[
                      item.status as keyof typeof DataSourceStatusText
                    ]?.text
                  }
                </Tag>
              </Space>
            ))}
          </Space>
        </div>
      </Spin>
    </Drawer>
  );
};
