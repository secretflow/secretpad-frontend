import {
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import { Divider, Drawer, Space } from 'antd';
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
  const fullScreenRef = React.useRef(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(fullScreenRef);
  const { visible, data, close } = modalManager.modals[resultDrawer.id];

  const { data: resultData, codeName, outputId } = data || {};

  const handleClose = () => {
    modalManager.closeModal(resultDrawer.id);
  };

  return (
    <Drawer
      title={
        <div className={styles.resultModalTitle}>
          <span>执行结果</span>
          {!isFullscreen && resultData?.type === 'report' && (
            <Space
              className={(styles.actionIcon, styles.resultExitFullScreen)}
              onClick={enterFullscreen}
            >
              <FullscreenOutlined />
              <span>全屏</span>
              <Divider type="vertical" />
            </Space>
          )}
        </div>
      }
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
      <div
        ref={fullScreenRef}
        className={classNames({ [styles.fullScreenContentPage]: isFullscreen })}
      >
        {isFullscreen && (
          <div className={styles.fullScreenHeader}>
            <div className={styles.title}>执行结果</div>
            <Space
              className={(styles.actionIcon, styles.exit)}
              onClick={exitFullscreen}
            >
              <FullscreenExitOutlined />
              <span>退出全屏</span>
              <Divider type="vertical" />
              <span
                className={styles.close}
                onClick={() => {
                  exitFullscreen();
                  handleClose();
                }}
              >
                X
              </span>
            </Space>
          </div>
        )}
        <div className={classNames({ [styles.fullScreenContentWrap]: isFullscreen })}>
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
            <ResultReportComponent
              data={resultData}
              id={outputId}
              codeName={codeName}
              visible={visible}
            />
          )}
          {!resultData?.type && <span>非数据参与方，无计算结果</span>}
        </div>
      </div>
    </Drawer>
  );
};

export const resultDrawer = {
  id: 'component-result',
  visible: false,
};

getModel(DefaultModalManager).registerModal(resultDrawer);
