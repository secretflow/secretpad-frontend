import { useLayoutEffect } from 'react';
import { proxy, useSnapshot } from 'valtio';

class Model {
  constructor() {
    return proxy(this);
  }

  onViewMount() {
    return;
  }

  onViewUnMount() {
    return;
  }
}

const ModelMap = new WeakMap();

type NewableType<T> = new (...args: any[]) => T;
type Newable<T extends NewableType<T>> = new (...args: any[]) => InstanceType<T>;

const getModel = function <T extends Newable<T>>(model: T) {
  let modelInstance = ModelMap.get(model);
  if (!modelInstance) {
    modelInstance = new model();
    ModelMap.set(model, modelInstance);
  }

  return modelInstance as InstanceType<T>;
};

const useModel = function <T extends Newable<T>>(model: T) {
  const modelInstance: Model = getModel(model);

  useLayoutEffect(() => {
    modelInstance.onViewMount();

    return () => {
      modelInstance.onViewUnMount();
    };
  }, []);

  useSnapshot(modelInstance);
  return modelInstance as InstanceType<T>;
};

export { Model, useModel, getModel };
