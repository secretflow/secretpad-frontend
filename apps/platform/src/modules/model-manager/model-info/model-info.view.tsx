import { DownOutlined } from '@ant-design/icons';
import { Descriptions, Drawer, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect } from 'react';

import { useModel } from '@/util/valtio-helper';

import { ModelService } from '../model-service';

import styles from './index.less';

type ModelInfoModalType = {
  visible: boolean;
  close: () => void;
  data?: API.ModelPackVO;
  onOk?: () => void;
};

export type ModelServingDetail = {
  nodeId: string;
  nodeName: string;
  featureHttp: string;
  featuresItem: FeaturesType[];
  sourcePath: string;
  isMock: boolean;
};

interface FeaturesType {
  into: string;
  online: string;
}

export const ModelReleaseInfoModal = (props: ModelInfoModalType) => {
  const { visible, data = {}, close } = props;
  const modelService = useModel(ModelService);

  const ModelReleaseInfo = async (servingId: string) => {
    await modelService.getModelServiceInfo(servingId);
  };

  useEffect(() => {
    if (!visible) return;
    if (data.servingId) {
      ModelReleaseInfo(data.servingId);
    }
  }, [visible, data.servingId]);

  const columns: ColumnsType<ModelServingDetail> = [
    { title: '预测节点', dataIndex: 'nodeName', key: 'nodeName', width: 100 },
    {
      title: '特征服务',
      dataIndex: 'featureHttp',
      key: 'featureHttp',
      render: (featureHttp: string, record) =>
        record.isMock ? (
          <div className={styles.mockStyle}>
            <span>mock服务</span>
            <Tag color="green">Mock</Tag>
          </div>
        ) : (
          <span style={{ wordBreak: 'break-all' }}>{featureHttp}</span>
        ),
    },
    { title: 'endpoints', dataIndex: 'endpoints', key: 'endpoints' },
  ];

  const subColumns: ColumnsType<FeaturesType> = [
    {
      title: <div className={styles.intoHeader}>入模特征</div>,
      dataIndex: 'into',
      key: 'into',
      width: 340,
      render: (text: string) => <div style={{ marginLeft: 48 }}>{text}</div>,
    },
    {
      title: '在线特征',
      dataIndex: 'online',
      key: 'online',
    },
  ];

  return (
    <Drawer
      title={`「${data.modelName}」 服务详情`}
      destroyOnClose
      open={visible}
      onClose={close}
      width={680}
    >
      <div className={styles.modelDesc}>
        <Descriptions column={1}>
          <Descriptions.Item label="服务ID">
            {modelService.modelServingDetail.servingId || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="模型ID">
            {modelService.modelServingDetail.modelId || '-'}
          </Descriptions.Item>
          {modelService.modelServingDetailList.map((item) => (
            <Descriptions.Item key={item.nodeName} label={`${item.nodeName}模型路径`}>
              {item?.sourcePath || '-'}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>
      <div className={styles.featureTitle}>特征匹配</div>
      <Table
        pagination={{
          hideOnSinglePage: true,
        }}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              dataSource={record.featuresItem}
              columns={subColumns}
              size="small"
              className={styles.tableFeatures}
            />
          ),
          rowExpandable: () => true,
        }}
        dataSource={modelService.modelServingDetailList}
        size="small"
        rowKey={(record) => record.nodeId}
        className={styles.tableContent}
      />
      <div className={styles.featureTitle}>
        <Space>
          资源配置
          <Space onClick={modelService.setToggle} className={styles.configToggle}>
            <DownOutlined
              style={{
                transform: modelService.toggle ? `rotate(180deg)` : `rotate(0)`,
              }}
            />
            {modelService.toggle ? '收起' : '展开'}
          </Space>
        </Space>
      </div>
      <div style={{ display: modelService.toggle ? 'block' : 'none' }}>
        {modelService.modelServingDetailList.map((item) => {
          return (
            <div className={styles.config} key={item.nodeId}>
              <div className={styles.configLabel}>{item.nodeName}</div>
              <div className={styles.configContent}>
                <Descriptions column={4} className={styles.descriptionClass}>
                  <Descriptions.Item label="最小CPU">
                    {`${item.resources.minCPU}核`}
                  </Descriptions.Item>
                  <Descriptions.Item label="最大CPU">
                    {`${item.resources.maxCPU}核`}
                  </Descriptions.Item>
                  <Descriptions.Item label="最小Memory">
                    {`${item.resources.minMemory}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="最大Memory">
                    {`${item.resources.maxMemory}`}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          );
        })}
      </div>
    </Drawer>
  );
};
