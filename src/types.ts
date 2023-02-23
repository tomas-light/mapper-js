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

export type Config<Source extends object, DefaultValue> = {
  copyArrays?: true;
  copyObjects?: true;
  /** 'select' has more priority than 'ignore' property */
  select?: Array<DottedKeys<Source>>;
  /** this property works only when 'select' property is not passed */
  ignore?: Array<DottedKeys<Source>>;
  /** assign this value to each mapped property, whose value is undefined */
  defaultValueIfUndefined?: DefaultValue;
};

export type Primitives = string | number | boolean | undefined | symbol | bigint | null;

export type NotArray = Record<string | symbol | number, unknown>;

/**
 * Introduce strong typing in auto mapping result, based on the passed configuration.
 * */
export type AutoMapResult<Source extends object, DefaultValue, SourceConfig extends Config<Source, DefaultValue>> =
  SourceConfig extends {
      select: Array<infer SelectedKeys extends DottedKeys<Source>>;
      ignore: Array<infer IgnoredKeys extends DottedKeys<Source>>;
    }
    ? MapFunctionResult<Source, DefaultValue, SourceConfig, SelectedKeys, IgnoredKeys>
    : SourceConfig extends {
        select: Array<infer SelectedKeys extends DottedKeys<Source>>;
      }
      ? MapFunctionResult<Source, DefaultValue, SourceConfig, SelectedKeys, never>
      : SourceConfig extends {
          ignore: Array<infer IgnoredKeys extends DottedKeys<Source>>;
        }
        ? MapFunctionResult<Source, DefaultValue, SourceConfig, keyof Source, IgnoredKeys>
        : MapFunctionResult<Source, DefaultValue, SourceConfig, keyof Source, never>;

export type MapFunctionResult<
  Source extends object,
  DefaultValue,
  SourceConfig extends Config<Source, DefaultValue>,
  SelectedKeys extends keyof Source,
  IgnoredKeys extends keyof Source
> =
  SourceConfig extends { copyObjects: true }
    ? SourceConfig extends { copyArrays: true }
      ? DeepSelect<Source, DefaultValue, SelectedKeys, IgnoredKeys, any>
      : DeepSelect<Source, DefaultValue, SelectedKeys, IgnoredKeys, Primitives | NotArray>
    : SourceConfig extends { copyArrays: true }
      ? DeepSelect<Source, DefaultValue, SelectedKeys, IgnoredKeys, Primitives | Array<any>>
      : DeepSelect<Source, DefaultValue, SelectedKeys, IgnoredKeys, Primitives>;

export type DeepSelect<
  T extends object,
  DefaultValue,
  SelectedKeys extends keyof T,
  IgnoredKeys extends keyof T = never,
  ValueConstraint = any
> = {
  [key in string & keyof T as key extends Exclude<SelectedKeys, IgnoredKeys>
    ? T[key] extends ValueConstraint
      ? key
      : never
    : SelectedKeys extends `${key}.${string}`
      ? key extends IgnoredKeys
        ? never
        : key
      : never]:
  IsUndefined<T[key]> extends true
    // replace undefined value with default value
    ? IsUndefined<DefaultValue> extends true
      ? undefined
      : undefined | DefaultValue
    //
    : T[key] extends Primitives | Array<any>
      ? T[key]
      : T[key] extends object
        ? DeepSelect<
          T[key],
          DefaultValue,
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


export type IsUndefined<T> = undefined & T extends never ? false : true;

/*
function temp<T>(t: T): undefined extends T ? null : T {
  return null as any;
}

type A1 = null extends number ? true : false;
type A2 = null extends object ? true : false;
type A3 = null extends string ? true : false;
type A4 = null extends null ? true : false;
type A5 = null extends undefined ? true : false;
type A6 = undefined extends null ? true : false;

type B1 = undefined & {};
type B2 = undefined & undefined;
type B3 = undefined & unknown;

type D1 = undefined extends never ? true : false;
type D2 = null extends never ? true : false;
type D3 = Primitives extends never ? true : false;
type D4 = Array<any> extends never ? true : false;
type D5 = object extends never ? true : false;
type D6 = number extends never ? true : false;

type C1 = IsUndefined<undefined>;
type C2 = IsUndefined<number>;
type C3 = IsUndefined<object>;
type C4 = IsUndefined<string>;
type C5 = IsUndefined<null>;
type C6 = IsUndefined<unknown>;

const t1 = temp(23);
*/
