import { Drawer } from 'antd';
import classNames from 'classnames';
import classnames from 'classnames';
import { parse } from 'query-string';
import React from 'react';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';
import recordLayoutStyle from '@/modules/layout/record-layout/index.less';
import { getModel, useModel } from '@/util/valtio-helper';

import { DagLogService } from './dag-log.service';
import styles from './index.less';

const CONFIG_MIN_WIDTH = 30;
const CONFIG_MAX_WIDTH = 600;

interface IDagLogDrawer {
  children: React.ReactNode;
}

export const DagLogDrawer = ({ children }: IDagLogDrawer) => {
  const service = useModel(DagLogService);

  const modalManager = useModel(DefaultModalManager);

  const modal = modalManager.modals[dagLogDrawer.id];

  const { close, data, visible } = modal || {};

  const { setLogMainHeight, setLogMainMin, setUnfold, sliderHeight, setSliderHight } =
    service;

  const handleClose = () => {
    service.cancel();
    if (close) {
      close();
    }
  };

  React.useEffect(() => {
    if (!data) return;

    const { search } = window.location;
    const { projectId, dagId } = parse(search);

    const { nodeData, from } = data;

    if (visible) {
      service.getLogContent(nodeData, projectId as string, dagId as string, from);
    }
  }, [data, visible]);

  React.useEffect(() => {
    handleClose();
  }, []);

  const [dragging, setDragging] = React.useState(false);
  const resizeRef = React.useRef<HTMLDivElement>(null);

  const sliderResizeMouseMove = (e: MouseEvent) => {
    if (resizeRef && resizeRef.current) {
      const resize = document.body.clientHeight - e.pageY - 2;
      if (resize < CONFIG_MIN_WIDTH) {
        setLogMainMin();
        setSliderHight(CONFIG_MIN_WIDTH);
        return;
      }
      if (resize > CONFIG_MAX_WIDTH) {
        setUnfold(false);
        setLogMainHeight(CONFIG_MAX_WIDTH);
        setSliderHight(CONFIG_MAX_WIDTH);
        return;
      }
      setUnfold(false);
      setLogMainHeight(resize);
      setSliderHight(resize);
    }
  };

  React.useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', sliderResizeMouseMove);
    } else {
      document.removeEventListener('mousemove', sliderResizeMouseMove);
    }
    return () => {
      document.removeEventListener('mousemove', sliderResizeMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  document.onmouseup = () => {
    setDragging(false);
  };

  return (
    <Drawer
      open={visible}
      autoFocus={false}
      onClose={handleClose}
      closable={false}
      placement="bottom"
      title={null}
      rootClassName={classNames(styles.logDrawerRoot, { [styles.logDrawer]: dragging })}
      height={service.logMainHeight}
      mask={false}
      bodyStyle={{
        padding: 0,
        overflow: 'hidden',
      }}
      getContainer={() => {
        return (
          document.querySelector(`.${dagLayoutStyle.center}`) ||
          (document.querySelector(`.${recordLayoutStyle.center}`) as Element)
        );
      }}
      contentWrapperStyle={{
        // marginLeft: 240,
        boxShadow: 'none',
        marginRight: service.logMarginLeft,
      }}
    >
      <div
        className={classnames(styles.sliderResize, {
          [styles.topRadius]: !service.unfold,
        })}
        style={{ bottom: sliderHeight }}
        onMouseUp={() => {
          setDragging(false);
        }}
        onMouseDown={() => {
          setDragging(true);
        }}
        ref={resizeRef}
      >
        <div className={classnames({ [styles.anchor]: !service.unfold })}></div>
      </div>
      {children}
    </Drawer>
  );
};

export const dagLogDrawer = {
  id: 'dag-log-drawer-view-id',
  visible: false,
};

getModel(DefaultModalManager).registerModal(dagLogDrawer);
