import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import { BinningResultDrawerView } from '../../drawer';
import styles from '../../index.less';

const SaveBtn = () => {
  const { saveComponentConfig, binningData, resetBinningTable } = useModel(
    BinModificationsRenderView,
  );

  const { setVisible } = useModel(BinningResultDrawerView);

  return (
    <div className={styles.saveBtnArea}>
      <Button
        type="primary"
        onClick={() => {
          setVisible(false);
          resetBinningTable();
          saveComponentConfig(binningData!);
        }}
      >
        保存分箱
      </Button>
    </div>
  );
};

export default SaveBtn;
