import { Drawer } from 'antd';
import classNames from 'classnames';
import classnames from 'classnames';
import { parse } from 'query-string';
import React from 'react';

import { Platform } from '@/components/platform-wrapper';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';
import recordLayoutStyle from '@/modules/layout/record-layout/index.less';
import { getModel, useModel } from '@/util/valtio-helper';

import { LoginService } from '../login/login.service';

import { DagLogService } from './dag-log.service';
import styles from './index.less';
import { SlsService } from './sls-service';

const CONFIG_MIN_WIDTH = 30;
const CONFIG_MAX_WIDTH = 600;

interface IDagLogDrawer {
  children: React.ReactNode;
}

export const DagLogDrawer = ({ children }: IDagLogDrawer) => {
  const service = useModel(DagLogService);
  const slsService = useModel(SlsService);
  const loginService = useModel(LoginService);

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

    const { nodeData, from, nodeParties } = data;
    // P2P 模式下不需要进行参与方选择，只需要展示自己的
    if (loginService?.userInfo?.platformType === Platform.AUTONOMY) {
      if (nodeData.codeName === 'read_data/datatable') {
        slsService.nodePartiesList = nodeParties;
      } else {
        slsService.nodePartiesList =
          nodeParties?.filter(
            (item: { nodeId: string | undefined }) =>
              item.nodeId === loginService?.userInfo?.ownerId,
          ) || [];
      }
    } else {
      slsService.nodePartiesList = nodeParties || [];
    }
    slsService.currentNodePartiesId = slsService.nodePartiesList[0]?.nodeId;

    if (visible) {
      service.getLogContent(nodeData, projectId as string, dagId as string, from);
      slsService.slsRequestParams = {
        data: nodeData,
        projectId: projectId as string,
        graphId: dagId as string,
        from,
      };
      slsService.getSlsLogContent(
        nodeData,
        projectId as string,
        dagId as string,
        from,
        slsService.currentNodePartiesId,
      );
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
