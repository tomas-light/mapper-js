type AbstractConstructor<Instance = any> = abstract new (...args: any[]) => Instance;
type Constructor<Instance = any> = new (...args: any[]) => Instance;

type AnyConstructor<Instance extends object = object> = AbstractConstructor<Instance> | Constructor<Instance>;

export type MapFunctionKey<Instance extends object = object> = AnyConstructor<Instance> | symbol;

/**
 * * get keys of primitive types;
 * * get keys of arrays;
 * * get keys of objects and all nested objects with dot separation, like:
 * @example
 * const myObj = {
 *   foo: {
 *     bar: {
 *       zed: {
 *         prop: string
 *        }
 *     }
 *   }
 * };
 * type Keys = DottedKeys<typeof myObj>; // 'foo' | 'foo.bar' | 'foo.bar.zed' | 'foo.bar.zed.prop'
 * */
export type DottedKeys<T extends object> = keyof {
  [key in keyof T as key extends string
    ? T[key] extends infer Value
      ? Value extends Primitives | Array<any>
        ? key
        : Value extends object
          ? key | (DottedKeys<Value> extends string ? `${key}.${DottedKeys<Value>}` : key)
          : key
      : never
    : never]: unknown;
};

export type Config<Source extends object> = {
  copyArrays?: true;
  copyObjects?: true;
  /** 'select' has more priority than 'ignore' property */
  select?: Array<DottedKeys<Source>>
  /** this property works only when 'select' property is not passed */
  ignore?: Array<DottedKeys<Source>>
};

export type Primitives = string | number | boolean | undefined | symbol | bigint | null;

export type NotArray = Record<string | symbol | number, unknown>;

/**
 * Introduce strong typing in auto mapping result, based on the passed configuration.
 * */
export type AutoMapFunction<Source extends object, SourceConfig extends Config<Source>> =
  SourceConfig extends {
      select: Array<infer SelectedKeys extends DottedKeys<Source>>;
      ignore: Array<infer IgnoredKeys extends DottedKeys<Source>>;
    }
    ? MapFunctionResult<Source, SourceConfig, SelectedKeys, IgnoredKeys>
    : SourceConfig extends {
        select: Array<infer SelectedKeys extends DottedKeys<Source>>;
      }
      ? MapFunctionResult<Source, SourceConfig, SelectedKeys, never>
      : SourceConfig extends {
          ignore: Array<infer IgnoredKeys extends DottedKeys<Source>>;
        }
        ? MapFunctionResult<Source, SourceConfig, keyof Source, IgnoredKeys>
        : MapFunctionResult<Source, SourceConfig, keyof Source, never>;

export type MapFunctionResult<
  Source extends object,
  SourceConfig extends Config<Source>,
  SelectedKeys extends keyof Source,
  IgnoredKeys extends keyof Source
> =
  SourceConfig extends { copyObjects: true }
    ? SourceConfig extends { copyArrays: true }
      ? DeepSelect<Source, SelectedKeys, IgnoredKeys, any>
      : DeepSelect<Source, SelectedKeys, IgnoredKeys, Primitives | NotArray>
    : SourceConfig extends { copyArrays: true }
      ? DeepSelect<Source, SelectedKeys, IgnoredKeys, Primitives | Array<any>>
      : DeepSelect<Source, SelectedKeys, IgnoredKeys, Primitives>;

export type DeepSelect<
  T extends object,
  SelectedKeys extends keyof T,
  IgnoredKeys extends keyof T = never,
  ValueConstraint = any
> = {
  [key in string & (keyof T) as key extends Exclude<SelectedKeys, IgnoredKeys>
    ? T[key] extends ValueConstraint
      ? key
      : never
    : SelectedKeys extends `${key}.${string}`
      ? key extends IgnoredKeys
        ? never
        : key
      : never]: T[key] extends Primitives | Array<any>
    ? T[key]
    : T[key] extends object
      ? DeepSelect<
        T[key],
        NestedDottedKeys<T, SelectedKeys, key, T[key]>,
        NestedDottedKeys<T, IgnoredKeys, key, T[key]>,
        ValueConstraint
      >
      : never;
};

export type NestedDottedKeys<
  Source extends object,
  Keys extends keyof Source,
  Key extends keyof Source & string,
  NestedObject extends Source[Key] & object
> = Key extends Keys
  ? DottedKeys<NestedObject>
  : Keys extends `${Key}.${infer key}`
    ? key extends DottedKeys<NestedObject>
      ? key
      : never
    : never;
