import { Select } from 'antd';

interface SelectBeforeType {
  serviceType: string;
  onChange: (e: string) => void;
}

export enum ProtocolEnum {
  'NOTLS' = 'notls',
  'TLS' = 'tls',
  'MTLS' = 'mtls',
}

export const Protocol = {
  [ProtocolEnum.NOTLS]: 'http://',
  [ProtocolEnum.TLS]: 'https://',
  [ProtocolEnum.MTLS]: 'https://',
};

const { Option } = Select;

export const SelectBefore = (props: SelectBeforeType) => {
  const { serviceType, onChange } = props;
  return (
    <Select value={serviceType} onChange={(e) => onChange(e)}>
      <Option value="http://">http://</Option>
      <Option value="https://">https://</Option>
    </Select>
  );
};

export const getProtocol = (url?: string, protocolType?: ProtocolEnum) => {
  if (!url) return 'http://';
  const type = protocolType ? Protocol[protocolType] : 'http://';
  const protocolMatch = url.match(/^(https?):/);
  const protocol = protocolMatch ? `${protocolMatch[1]}://` : type;
  return protocol;
};

export const replaceProtocol = (url?: string) => {
  if (!url) return '';
  return url.replace(/(^\w+:|^)\/\//, '');
};
