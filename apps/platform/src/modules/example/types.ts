export type TodoItem = {
  title: string;
  description: string | undefined;
  isFinished: boolean;
};

export type ItemCreateFormProps = {
  open: boolean;
  onCreate: (values: Omit<TodoItem, 'isFinished'>) => void;
  onCancel: () => void;
};
