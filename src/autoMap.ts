import {
  Config, AutoMapFunction, DottedKeys, Primitives, DeepSelect, NestedDottedKeys, MapFunctionResult, NotArray,
} from './types';

export const autoMap = <Source extends object, SourceConfig extends Config<Source>>(
  source: Source,
  destination: object,
  config: SourceConfig
): AutoMapFunction<Source, SourceConfig> => {
  if (typeof source !== 'object' || source === null) {
    return source;
  }
  if (Array.isArray(source)) {
    throw new Error('auto mapping is not available when the source object is an array');
  }

  const sourceKeys = Object.keys(source) as (keyof typeof source)[];
  let filteredKeys: (keyof typeof source)[] = sourceKeys;
  if ('select' in config && config.select && config.select.length > 0) {
    const topLevelSelectedKeys = getFirstLevelOfDottedKeys(config.select);
    filteredKeys = filteredKeys.filter((selectedKey) => topLevelSelectedKeys.includes(selectedKey as string));
  }
  // if ('ignore' in config && config.ignore) {
  //   const topLevelIgnoredKeys = getFirstLevelOfDottedKeys(config.ignore);
  //   filteredKeys = filteredKeys.filter((selectedKey) => !topLevelIgnoredKeys.includes(selectedKey as string));
  // }
  if ('ignore' in config && config.ignore) {
    filteredKeys = filteredKeys.filter((selectedKey) => !config.ignore!.includes(selectedKey as any));
  }

  for (const sourceKey of filteredKeys) {
    const value = source[sourceKey];
    if (Array.isArray(value)) {
      if (config.copyArrays) {
        (destination as Source)[sourceKey] = [...value] as Source[typeof sourceKey];
      }
      continue;
    }

    if (value === null || value === undefined) {
      (destination as Source)[sourceKey] = value;
      continue;
    }

    if (typeof value !== 'object') {
      (destination as Source)[sourceKey] = value;
      continue;
    }

    if (!config.copyObjects) {
      continue;
    }

    const nextLevelConfig = {
      ...config,
    };

    if ('select' in nextLevelConfig && nextLevelConfig.select) {
      nextLevelConfig.select = getNextLevelOfDottedKeys(nextLevelConfig.select) as any;

      if (nextLevelConfig.select && nextLevelConfig.select.length > 0) {
        const doesConfigIncludesEntireObjectLevel =
          // just type guard
          'select' in config &&
          config.select &&
          // config includes sourceKey (because we are in related condition branch), but does not contains `<sourceKey>.<nestedKey>`
          !config.select.filter((key) => (key as string).startsWith(`${sourceKey.toString()}.`));
        if (doesConfigIncludesEntireObjectLevel) {
          // if you pass `select: ['prop']` for object `{ prop: { a: '', b: '', c: '' } }`
          // it means you want to copy entire `prop` object
          // so we have to add all its keys to 'select' property
          Object.keys(value).forEach((key) => {
            nextLevelConfig.select!.push(key as any);
          });
        }
      }
    }

    if ('ignore' in nextLevelConfig && nextLevelConfig.ignore) {
      nextLevelConfig.ignore = getNextLevelOfDottedKeys(nextLevelConfig.ignore) as any;
    }

    (destination as Source)[sourceKey] = autoMap(value, {}, nextLevelConfig as Config<object>) as any;
  }

  return destination as any;
};

export function getFirstLevelOfDottedKeys<T extends object>(dottedKeys: DottedKeys<T>[]) {
  return dottedKeys.map((dottedKey) => {
    if (typeof dottedKey !== 'string') {
      return dottedKey;
    }
    const firstDotIndex = dottedKey.indexOf('.');
    if (firstDotIndex > -1) {
      return dottedKey.substring(0, firstDotIndex);
    }
    return dottedKey;
  });
}

export function getNextLevelOfDottedKeys<T extends object>(dottedKeys: DottedKeys<T>[]) {
  const filteredKeys = dottedKeys.filter((key) => typeof key === 'string' && key.includes('.')) as string[];
  return filteredKeys.map((dottedKey) => {
    const firstDotIndex = dottedKey.indexOf('.');
    return dottedKey.substring(firstDotIndex + 1);
  });
}
