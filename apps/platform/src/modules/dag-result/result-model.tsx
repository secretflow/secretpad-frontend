import { Button, Tag, Typography } from 'antd';

import styles from './index.less';
import type { ResultComponentProps } from './types';
import { formatTimestamp } from './utils';

const { Paragraph } = Typography;

export const ResultModelComponent = (props: ResultComponentProps<'model'>) => {
  const { data, id } = props;

  const { gmtCreate, meta } = data;
  const { rows } = meta;

  return (
    <div className={styles.report}>
      <div className={styles.item}>
        <span className={styles.name}>{id}</span>
        <Tag color="rgba(0,104,250,0.08)">模型</Tag>
      </div>

      <div className={styles.time}>
        <span className={styles.timeLabel}>生成时间：</span>
        {gmtCreate && <span>{formatTimestamp(gmtCreate)}</span>}
      </div>

      {rows.map((row, index) => {
        const { path, nodeId } = row;

        return (
          <Paragraph
            key={index}
            copyable={{
              text: path,
              tooltips: ['复制', '复制成功'],
            }}
          >
            <div className={styles.item} key={index}>
              <span className={styles.timeLabel}>{nodeId}模型路径：</span>
              <span>{path}</span>
              <Button
                type="link"
                size="small"
                style={{ paddingLeft: 20 }}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = `/node?nodeId=${nodeId}&tab=result&resultName=${path}`;
                  a.target = '_blank';
                  a.click();
                }}
              >
                查看结果
              </Button>
            </div>
          </Paragraph>
        );
      })}
    </div>
  );
};
