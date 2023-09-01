import { CloseOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import classNames from 'classnames';
import React from 'react';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';
import recordLayoutStyle from '@/modules/layout/record-layout/index.less';
import { getModel, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import { ResultModelComponent } from './result-model';
import { ResultReportComponent } from './result-report';
import { ResultRuleComponent } from './result-rules';
import { ResultTableComponent } from './result-table';
import type { OutputType } from './types';

const RESULT_WIDTH = 600;

export const ResultDrawer = () => {
  const modalManager = useModel(DefaultModalManager);

  const { visible, data, close } = modalManager.modals[resultDrawer.id];

  const { data: report, codeName, outputId } = data || {};

  const [resultData, setResultData] = React.useState<any>(report);

  const handleClose = () => {
    modalManager.closeModal(resultDrawer.id);
  };

  React.useEffect(() => {
    setResultData(report);
  }, [report]);

  return (
    <Drawer
      title="执行结果"
      placement="right"
      width={RESULT_WIDTH}
      closable={false}
      onClose={close}
      open={visible}
      autoFocus={false}
      rootClassName={classNames(styles.resultDrawer)}
      getContainer={() => {
        return (
          document.querySelector(`.${dagLayoutStyle.center}`) ||
          (document.querySelector(`.${recordLayoutStyle.center}`) as Element)
        );
      }}
      mask={false}
      extra={<CloseOutlined style={{ fontSize: 12 }} onClick={handleClose} />}
    >
      {resultData?.type === 'rule' && (
        <ResultRuleComponent
          data={resultData as OutputType<'rule'>}
          id={outputId}
          codeName={codeName}
        />
      )}

      {resultData?.type === 'table' && (
        <ResultTableComponent data={resultData} id={outputId} codeName={codeName} />
      )}

      {resultData?.type === 'model' && (
        <ResultModelComponent data={resultData} id={outputId} codeName={codeName} />
      )}

      {resultData?.type === 'report' && (
        <ResultReportComponent data={resultData} id={outputId} codeName={codeName} />
      )}
    </Drawer>
  );
};

export const resultDrawer = {
  id: 'component-result',
  visible: false,
};

getModel(DefaultModalManager).registerModal(resultDrawer);
