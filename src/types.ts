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

export type Config<Source extends object> = {
  copyArrays?: true;
  copyObjects?: true;
  /** 'select' has more priority than 'ignore' property */
  select?: Array<DottedKeys<Source>>;
  /** this property works only when 'select' property is not passed */
  ignore?: Array<DottedKeys<Source>>;
  /** assign this value to each mapped property, whose value is undefined */
  defaultValueIfUndefined?: any;
  /** assign this value to each mapped property, whose value is null */
  defaultValueIfNull?: any;
  /** assign this value to each mapped property, whose value is null or undefined */
  defaultValueIfNullOrUndefined?: any;
};

export type Primitives = string | number | boolean | undefined | symbol | bigint | null;

export type NotArray = Record<string | symbol | number, unknown>;

/**
 * Introduce strong typing in auto mapping result, based on the passed configuration.
 * */
export type AutoMapResult<Source extends object, SourceConfig extends Config<Source>> =
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
  IgnoredKeys extends keyof Source,
> =
  SourceConfig extends { copyObjects: true }
    ? SourceConfig extends { copyArrays: true }
      ? DeepSelect<Source, SourceConfig, SelectedKeys, IgnoredKeys, any>
      : DeepSelect<Source, SourceConfig, SelectedKeys, IgnoredKeys, Primitives | NotArray>
    : SourceConfig extends { copyArrays: true }
      ? DeepSelect<Source, SourceConfig, SelectedKeys, IgnoredKeys, Primitives | Array<any>>
      : DeepSelect<Source, SourceConfig, SelectedKeys, IgnoredKeys, Primitives>;

export type DeepSelect<
  T extends object,
  SourceConfig extends Pick<Config<any>, 'defaultValueIfUndefined'>,
  SelectedKeys extends keyof T,
  IgnoredKeys extends keyof T = never,
  ValueConstraint = any,
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
  T[key] extends infer Value ? Value extends T[key]
      ? IsAny<Value> extends true
        // don't try to infer any type
        ? Value

        : IsUndefined<Value> extends true
          ? SourceConfig extends {
              defaultValueIfUndefined: infer DefaultValueForUndefined
            }
            ? IsAny<DefaultValueForUndefined> extends true
              ? undefined
              : Value | DefaultValueForUndefined
            : SourceConfig extends {
                defaultValueIfNullOrUndefined: infer DefaultValue
              }
              ? IsAny<DefaultValue> extends true
                ? undefined
                : Value | DefaultValue
              : undefined
          : IsNull<Value> extends true
            ? SourceConfig extends {
                defaultValueIfNull: infer DefaultValueForNull
              }
              ? IsAny<DefaultValueForNull> extends true
                ? null
                : Value | DefaultValueForNull
              : SourceConfig extends {
                  defaultValueIfNullOrUndefined: infer DefaultValue
                }
                ? IsAny<DefaultValue> extends true
                  ? null
                  : Value | DefaultValue
                : null

            : Value extends Primitives | Array<any>
              ? Value
              : Value extends object
                ? DeepSelect<
                  Value,
                  SourceConfig,
                  NestedDottedKeys<T, SelectedKeys, key, Value>,
                  NestedDottedKeys<T, IgnoredKeys, key, Value>,
                  ValueConstraint
                >
                : never
      : never
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
export type IsNull<T> = null & T extends never ? false : true;

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

expectType<false>(anyV as IsNull<undefined>);
expectType<false>(anyV as IsNull<number>);
expectType<false>(anyV as IsNull<object>);
expectType<false>(anyV as IsNull<string>);
expectType<true>(anyV as IsNull<null>);
expectType<true>(anyV as IsNull<unknown>);

expectType<false>(anyV as IsAny<undefined>);
expectType<false>(anyV as IsAny<number>);
expectType<false>(anyV as IsAny<object>);
expectType<false>(anyV as IsAny<string>);
expectType<false>(anyV as IsAny<null>);
expectType<true>(anyV as IsAny<unknown>);
expectType<true>(anyV as IsAny<unknown | undefined>);
expectType<true>(anyV as IsAny<any>);


// endregion
