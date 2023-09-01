export const ComponentInterpreterService = Symbol('ComponentInterpreterService');

export type ComponentInterpreterService = {
  translationMap: Record<string, any>;
  getComponentTranslationMap(
    component:
      | {
          domain: string;
          name: string;
          version: string;
        }
      | string,
  ): any;
};
