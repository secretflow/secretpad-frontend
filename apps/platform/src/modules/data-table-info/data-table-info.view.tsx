import { CloseOutlined, RedoOutlined } from '@ant-design/icons';
import { Badge, Descriptions, message, Space, Tabs } from 'antd';
import { Drawer } from 'antd';
import type { TabsProps } from 'antd';
import React, { useEffect } from 'react';

import { DataSheetType } from '@/modules/data-manager/data-manager.service';
import { getDatatable } from '@/services/secretpad/DatatableController';
import { Model, useModel } from '@/util/valtio-helper';

import { DataTableStructure } from './component/data-table-structure';
import styles from './index.less';

interface PropsData {
  tableInfo: API.DatatableVO;
  node: API.NodeVO;
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
              onClick={() => viewInstance.refreshTableInfo(tableInfo, data.node)}
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
        <Descriptions.Item span={2} label="数据地址">
          {tableInfo.relativeUri}
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

  async refreshTableInfo(tableInfo: API.DatatableVO, node: API.NodeVO) {
    this.refreshing = true;

    const response = await getDatatable({
      datatableId: tableInfo.datatableId,
      nodeId: node.nodeId,
      type: tableInfo.type,
    });

    setTimeout(() => {
      this.refreshing = false;
    }, 500);

    const tableInfoData = response.data;
    this.tableInfo = tableInfoData;
    message.success('数据状态刷新成功');
  }
}
