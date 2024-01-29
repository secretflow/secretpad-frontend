import { FieldSelectTable } from './field-select-table';
import style from './index.less';
import { SelectedField } from './selected-field';
import type { FieldInfoType, TableInfoType } from './type';

export const FieldBlock = (props: IProps) => {
  const { schema, selectedFields = [], multiple, setSelectedFields } = props;

  // 把空值过滤掉
  const filterSelectedFields = selectedFields;
  return (
    <div className={style.fieldBlock}>
      <SelectedField
        selectedFields={filterSelectedFields}
        setSelectedFields={setSelectedFields}
        schema={schema}
        multiple={multiple}
      />
      <FieldSelectTable {...props} />
    </div>
  );
};

export interface IProps {
  schema: TableInfoType[] | TableInfoType | undefined;
  selectedFields: FieldInfoType[];
  setSelectedFields: (fields: FieldInfoType[]) => void;
  dataType?: string;
  multiple?: boolean;
  disabled?: boolean;
  rules?: { max?: number; min: number; excludes?: string[] };
}
