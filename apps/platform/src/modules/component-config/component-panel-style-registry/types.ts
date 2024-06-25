import type { FormInstance } from 'antd';

export type AttrConfig = {
  /** 是否展示，默认 true */
  isShow?: boolean;
  /** 顺序，从 0 开始，假如有其他配置是隐藏的，基于隐藏后的配置顺序生效 */
  order?: number;
  /**
    标题和输入框是否在同一行
    默认 false，即默认标题和输入框换行
    想要不换行：noWrap: true
  */
  style?: {
    noWrap?: boolean;
  };
  /* 是否是高级配置，默认为 false */
  isAdvancedConfig?: boolean;
};

export type ExtraOptions = {
  extraOptions?: {
    /** 自定义高级配置按钮 */
    getCustomAdvancedBtn?: () => React.FC<{
      form: FormInstance;
      onChange: (checked: boolean) => void;
      value: boolean;
    }>;
  };
};

export type IComponentPanelStyleConfigs = Record<
  string,
  { attrs: Record<string, AttrConfig> } & ExtraOptions
>;
