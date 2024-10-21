import { CloseOutlined, RedoOutlined } from '@ant-design/icons';
import { Badge, Descriptions, message, Space, Tabs } from 'antd';
import { Drawer } from 'antd';
import type { TabsProps } from 'antd';
import { parse } from 'query-string';
import React, { useEffect } from 'react';

import { hasAccess, Platform } from '@/components/platform-wrapper';
import { DataSheetType } from '@/modules/data-manager/data-manager.service';
import { getDatatable } from '@/services/secretpad/DatatableController';
import { Model, useModel } from '@/util/valtio-helper';

import { DataTableStructure } from './component/data-table-structure';
import styles from './index.less';

interface PropsData {
  tableInfo: API.DatatableVO;
}

interface IProps<T> {
  visible: boolean;
  close: () => void;
  data: T;
}

export const DataSheetText = {
  [DataSheetType.CSV]: '节点本地数据',
  [DataSheetType.HTTP]: 'HTTP数据',
  [DataSheetType.OSS]: 'OSS数据',
};

export const DataTableInfoDrawer: React.FC<IProps<PropsData>> = (props) => {
  const { visible, close, data } = props;
  const viewInstance = useModel(DataTableInfoDrawerView);
  const isAutonomy = hasAccess({ type: [Platform.AUTONOMY] });

  const tableInfo = viewInstance.tableInfo || {};

  useEffect(() => {
    viewInstance.tableInfo = data.tableInfo || {};
  }, [viewInstance, data]);

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: '数据表结构',
      children: <DataTableStructure schema={tableInfo.schema || []} />,
    },
    // {
    //   key: '2',
    //   label: '授权信息',
    //   children: <DataTableAuthComponent tableInfo={tableInfo} size="small" />,
    // },
  ];
  return (
    <Drawer
      title={
        <div>
          <Space style={{ fontSize: 16 }}>
            「{tableInfo.datatableName}」 详情{' '}
            <Space>
              {tableInfo.status === 'Available' ? (
                <Badge key="green" color="green" text="可用" />
              ) : (
                <Badge key="red" color="red" text="不可用" />
              )}
            </Space>
            <a
              style={{ fontSize: 14 }}
              onClick={() => viewInstance.refreshTableInfo(tableInfo, isAutonomy)}
            >
              <RedoOutlined spin={viewInstance.refreshing} /> 刷新状态
            </a>
          </Space>
        </div>
      }
      extra={<CloseOutlined style={{ fontSize: 12 }} onClick={close} />}
      width={700}
      open={visible}
      onClose={close}
      closable={false}
    >
      <Descriptions title="" column={2}>
        <Descriptions.Item label="所属数据源">
          {tableInfo.datasourceName}
        </Descriptions.Item>
        <Descriptions.Item label="数据源类型">
          {tableInfo?.datasourceType}
        </Descriptions.Item>
        {isAutonomy && (
          <Descriptions.Item label="所属节点">
            {tableInfo?.nodeName || '-'}
          </Descriptions.Item>
        )}
        <Descriptions.Item span={2} label="数据地址">
          {tableInfo.relativeUri}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="空缺值">
          {tableInfo?.nullStrs?.map((i) => `"${i}"`).join(',') || '-'}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="描述">
          {tableInfo.description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <div className={styles.tableWrapper}>
        <Tabs
          defaultActiveKey="1"
          destroyInactiveTabPane={true}
          tabBarStyle={{ border: 'none' }}
          items={tabItems}
        />
      </div>
    </Drawer>
  );
};

export const DataTableInfoId = 'DataTableInfoId';

type DatatableVO = API.DatatableVO;

export class DataTableInfoDrawerView extends Model {
  tableInfo?: DatatableVO;

  refreshing = false;

  async refreshTableInfo(tableInfo: API.DatatableVO, isAutonomy: boolean) {
    this.refreshing = true;
    const { ownerId } = parse(window.location.search);
    const refreshTableNodeId = isAutonomy ? tableInfo?.nodeId : ownerId;
    const response = await getDatatable({
      datatableId: tableInfo.datatableId,
      nodeId: refreshTableNodeId,
      type: tableInfo.type,
      datasourceType: tableInfo.datasourceType,
    });

    setTimeout(() => {
      this.refreshing = false;
    }, 500);

    const tableInfoData = {
      ...(response?.data?.datatableVO || {}),
      nodeId: response?.data?.nodeId,
      nodeName: response?.data?.nodeName,
    };
    this.tableInfo = tableInfoData;
    message.success('数据状态刷新成功');
  }
}
