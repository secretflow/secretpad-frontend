import { Form } from 'antd';
import type { FormInstance } from 'antd/lib';
import { useEffect, useState } from 'react';

export const useFormValidateOnly = (form: FormInstance) => {
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);

  useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () => {
        setSubmittable(true);
      },
      () => {
        setSubmittable(false);
      },
    );
  }, [values]);

  return { submittable };
};
