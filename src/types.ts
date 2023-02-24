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
      ? IsAny<Value> extends true
        ? key // don't try to infer any type
        : Value extends Primitives | Array<any>
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
  IsAny<T[key]> extends true
    // don't try to infer any type
    ? T[key]
    : IsUndefined<T[key]> extends true
      //
      // replace undefined value with default value
      ? IsUndefined<DefaultValue> extends true // if DefaultValue is not passed its type is "unknown" - we use "undefined" in this case
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

export type IsAny<T> = unknown extends T ? true : false;

// region test types

const expectType = <T>(valueOfType: T): void => undefined;

const anyV = null as unknown;

expectType<false>(anyV as null extends number ? true : false);
expectType<false>(anyV as null extends object ? true : false);
expectType<false>(anyV as null extends string ? true : false);
expectType<true>(anyV as null extends null ? true : false);
expectType<false>(anyV as null extends undefined ? true : false);
expectType<false>(anyV as undefined extends null ? true : false);

expectType<never>(anyV as undefined & {});
expectType<undefined>(anyV as undefined & unknown);

expectType<false>(anyV as undefined extends never ? true : false);
expectType<false>(anyV as null extends never ? true : false);
expectType<false>(anyV as Primitives extends never ? true : false);
expectType<false>(anyV as Array<any> extends never ? true : false);
expectType<false>(anyV as object extends never ? true : false);
expectType<false>(anyV as number extends never ? true : false);

expectType<true>(anyV as IsUndefined<undefined>);
expectType<false>(anyV as IsUndefined<number>);
expectType<false>(anyV as IsUndefined<object>);
expectType<false>(anyV as IsUndefined<string>);
expectType<false>(anyV as IsUndefined<null>);
expectType<true>(anyV as IsUndefined<unknown>);

expectType<false>(anyV as IsAny<undefined>);
expectType<false>(anyV as IsAny<number>);
expectType<false>(anyV as IsAny<object>);
expectType<false>(anyV as IsAny<string>);
expectType<false>(anyV as IsAny<null>);
expectType<true>(anyV as IsAny<unknown>);
expectType<true>(anyV as IsAny<any>);

// endregion
