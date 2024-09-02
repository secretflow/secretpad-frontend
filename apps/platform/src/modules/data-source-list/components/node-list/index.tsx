import { Tag, Tooltip } from 'antd';
import styles from './index.less';
import { DataSourceStatusText } from '../../data-source-list.service';
import { hasAccess, Platform } from '@/components/platform-wrapper';

type Props = {
  nodeIds: API.DataSourceRelatedNode[];
};

export const NodeList = (props: Props) => {
  const { nodeIds = [] } = props;
  const isAutonomy = hasAccess({ type: [Platform.AUTONOMY] });

  if (!isAutonomy) {
    return (
      <div>
        {(nodeIds || []).map((item, index) => (
          <Tag
            key={index}
            bordered={false}
            color={
              DataSourceStatusText[item.status as keyof typeof DataSourceStatusText]
                ?.color
            }
          >
            {
              DataSourceStatusText[item.status as keyof typeof DataSourceStatusText]
                ?.text
            }
          </Tag>
        ))}
      </div>
    );
  }

  return (
    <span className={styles.nodeListContent}>
      <span className={styles.nodeContent}>
        {nodeIds.slice(0, 2).map((item, index) => (
          <span className={styles.nodeContent} key={item.nodeName}>
            <span className={styles.nodeNameText}>{item?.nodeName}</span>
            <Tag
              bordered={false}
              color={
                DataSourceStatusText[item.status as keyof typeof DataSourceStatusText]
                  ?.color
              }
            >
              {
                DataSourceStatusText[item.status as keyof typeof DataSourceStatusText]
                  ?.text
              }
            </Tag>
            {nodeIds.length > 1 && index !== 1 && <span>、</span>}
          </span>
        ))}
      </span>
      {nodeIds.length > 2 && <span>...</span>}
      <span>
        共
        <Tooltip
          overlayClassName={styles.tooltipNodeContent}
          overlayInnerStyle={{
            padding: '4px 12px',
          }}
          title={
            <div>
              {(nodeIds || []).map((item) => (
                <div
                  className={styles.textContent}
                  style={{ verticalAlign: 'middle' }}
                  key={item.nodeName}
                >
                  <span className={styles.tooltipNodeName}>{item?.nodeName}</span>
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
                </div>
              ))}
            </div>
          }
          placement="rightTop"
          color="#fff"
        >
          <span className={styles.nodeIdsText}>{nodeIds.length}</span>
        </Tooltip>
        个节点
      </span>
    </span>
  );
};
