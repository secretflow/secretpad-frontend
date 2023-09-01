import style from './index.less';
import type { FieldInfoType } from './type';

export const FieldText = (props: IProps) => {
  const { selectedFields } = props;
  const text = `${selectedFields.map(({ colName }) => colName)}`;
  return <div className={style.fieldText}>{text}</div>;
};

export interface IProps {
  selectedFields: FieldInfoType[];
  setSelectedFields: (fields: FieldInfoType[]) => void;
}
