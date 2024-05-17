import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import { BinningResultDrawerView } from '../../drawer';
import styles from '../../index.less';

const SaveBtn = () => {
  const { saveComponentConfig, parametersData, resetParametersTable, disabled } =
    useModel(BinModificationsRenderView);

  const { setVisible } = useModel(BinningResultDrawerView);

  return (
    <div className={styles.saveBtnArea}>
      {disabled ? null : (
        <Button
          type="primary"
          onClick={() => {
            setVisible(false);
            resetParametersTable();
            saveComponentConfig(parametersData!);
          }}
        >
          保存分箱
        </Button>
      )}
    </div>
  );
};

export default SaveBtn;
