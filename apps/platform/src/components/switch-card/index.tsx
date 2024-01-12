import { CheckCircleFilled } from '@ant-design/icons';
import classnames from 'classnames';

import styles from './index.less';

export const SwitchCard = ({
  cardList,
  value,
  onChange,
}: {
  cardList: CardListItem[];
  value?: string;
  onChange?: (type: string) => void;
}) => {
  return (
    <div className={styles.cardContent}>
      {cardList.map(({ type, name, minimap, description }) => {
        return (
          <div
            key={type}
            className={classnames(styles.card, {
              [styles.checked]: value === type,
            })}
            onClick={() => {
              if (onChange) {
                onChange(type);
              }
            }}
          >
            <div className={styles.cardImg}>
              <img src={minimap} alt="" className={styles.imgContent} />
            </div>
            <div className={styles.cardTitle}>{name}</div>
            <div className={styles.cardDesc}>{description}</div>
            {value === type && <CheckCircleFilled className={styles.cardChecked} />}
          </div>
        );
      })}
    </div>
  );
};

export type CardListItem = {
  type: string;
  name: string;
  description: string;
  minimap: string;
};
