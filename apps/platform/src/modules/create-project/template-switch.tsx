import { CheckCircleFilled } from '@ant-design/icons';
import type { TourProps } from 'antd';
import { Popover, Tour } from 'antd';
import classnames from 'classnames';
import React, { useRef, useState } from 'react';

import type { PipelineTemplateContribution } from '../pipeline/pipeline-protocol';
import { PipelineTemplateType } from '../pipeline/pipeline-protocol';

import type { CreateProjectModalView } from './create-project.view';
import styles from './template.less';

export const TemplateSwitch: React.FC<{
  templateList: PipelineTemplateContribution[];
  value?: string;
  onChange?: (type: string) => void;
  showBlank: boolean;
  viewInstance: CreateProjectModalView;
  visible: boolean;
  computeMode: 'MPC' | 'TEE';
}> = (props) => {
  const {
    templateList,
    visible,
    value,
    onChange,
    showBlank,
    viewInstance,
    computeMode = 'MPC',
  } = props;
  const [tourInited, setTourInited] = useState(false);

  const templateComputeModeList = templateList.filter((item) =>
    (item?.computeMode || ['MPC']).includes(computeMode),
  );
  const templateListDisplay = showBlank
    ? templateComputeModeList.filter((i) => !i.argsFilled)
    : templateComputeModeList.filter(
        (i) => i.type !== PipelineTemplateType.BLANK && i.argsFilled,
      );

  const ref1 = useRef(null);
  const steps: TourProps['steps'] = [
    {
      title: '支持创建自定义训练流',
      description: '可以自定义数据、绘制自己的画布了',
      nextButtonProps: {
        children: <div>知道了</div>,
      },
      target: () => {
        if (ref1.current && !tourInited) {
          setTourInited(true);
        }
        return ref1.current;
      },
    },
  ];

  return (
    <div className={styles.templates}>
      {templateListDisplay.map(({ type, name, minimap, description }) => {
        return (
          <div
            key={type}
            className={classnames(styles.template, {
              [styles.checked]: value === type,
            })}
            onClick={() => {
              if (onChange) {
                onChange(type);
              }
            }}
          >
            <div className={styles.templateImg}>
              {type !== PipelineTemplateType.BLANK ? (
                <Popover
                  placement="bottom"
                  title="内容预览"
                  content={
                    <div className={styles.popverTemplateImage}>
                      <img
                        style={{ width: '100%', height: '100%' }}
                        src={minimap}
                        alt=""
                      />
                    </div>
                  }
                >
                  <img src={minimap} alt="" className={styles.imgContent} />
                </Popover>
              ) : (
                <img ref={ref1} src={minimap} alt="" className={styles.imgContent} />
              )}
            </div>
            <div className={styles.templateTitle}>{name}</div>
            <div className={styles.templateDesc}>{description}</div>
            {value === type && <CheckCircleFilled className={styles.templateChecked} />}
          </div>
        );
      })}
      {visible && (
        <Tour
          open={
            !viewInstance.guideTourService.CreateProjectTour && showBlank && tourInited
          }
          onClose={() => viewInstance.closeGuideTour()}
          mask={false}
          type="primary"
          zIndex={100000000}
          steps={steps}
          placement="right"
          rootClassName="create-project-tour"
        />
      )}
    </div>
  );
};
