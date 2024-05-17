export const unionSerializer = (val, clsName: string) => {
  console.log(val, 'unionSerializer');
  return {
    ...{ custom_value: val },
    custom_protobuf_cls: clsName,
  };
};

export const unionUnserializer = (val: {
  custom_value;
  custom_protobuf_cls: string;
}) => {
  console.log(val, 'unionUnserializer');
  if (!val) {
    return { table_name: '' };
  }

  const { custom_value } = val || {};

  return { ...custom_value };
};
