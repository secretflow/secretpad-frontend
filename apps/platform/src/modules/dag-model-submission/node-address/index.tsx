import { Col, Empty, Input, Row } from 'antd';
import styles from './index.less';

type IProps = {
  addressList: API.ModelPartyPathResponse[];
};

export const NodeAddress = (props: IProps) => {
  const { addressList } = props;

  return (
    <div className={styles.canvasPath}>
      {addressList.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={'请点击画布中可提交的组件'}
        />
      ) : (
        <div>
          {addressList.map((item, index) => {
            return (
              <div key={item.nodeId} className={styles.content}>
                <div className={styles.title}>{'存储节点' + (index + 1)}</div>
                <div>
                  <Row>
                    <Col span={12}>
                      <Input value={item.nodeName} disabled />
                    </Col>
                    <Col span={12}>
                      <Input value={item.dataSourcePath} disabled />
                    </Col>
                  </Row>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
