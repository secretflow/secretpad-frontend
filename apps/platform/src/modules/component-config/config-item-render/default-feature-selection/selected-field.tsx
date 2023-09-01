import React from 'react';

import { FieldText } from './field-text';
import style from './index.less';
import type { FieldInfoType, TableInfoType } from './type';

export const SelectedField = (props: IProps) => {
  return (
    <div className={style.selectedField}>
      <h4 className={style.header}>已选字段</h4>
      <FieldText {...props} />
    </div>
  );
};

export interface IProps {
  multiple?: boolean;
  schema: TableInfoType[] | TableInfoType | undefined;
  selectedFields: FieldInfoType[];
  setSelectedFields: (fields: FieldInfoType[]) => void;
}
