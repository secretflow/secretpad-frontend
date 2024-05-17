import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '../..';
import { ParametersResultDrawerView } from '../../drawer';
import styles from '../../index.less';

const SaveBtn = () => {
  const { saveComponentConfig, parametersData, disabled } = useModel(
    LinearModelParamsModificationsRenderView,
  );

  const { setVisible } = useModel(ParametersResultDrawerView);

  return (
    <div className={styles.saveBtnArea}>
      {disabled ? null : (
        <Button
          type="primary"
          onClick={() => {
            setVisible(false);
            saveComponentConfig(parametersData!);
          }}
        >
          保存模型参数
        </Button>
      )}
    </div>
  );
};

export default SaveBtn;
