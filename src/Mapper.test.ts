import { MapFunction } from './MapFunction';
import { Mapper } from './Mapper';

class Class1 {
  myProp: string;

  constructor(myProp: string) {
    this.myProp = myProp;
  }
}

class Class2 {
  yourProp: string;

  constructor(yourProp: string) {
    this.yourProp = yourProp;
  }
}

test('find', () => {
  const mapFn = new MapFunction<any>(
    nameof<Class1>(),
    nameof<Class2>(),
    () => undefined,
  );

  Mapper['mapFunctions'] = [
    mapFn,
  ];

  const result = Mapper['find'](
    nameof<Class1>(),
    nameof<Class2>()
  );
  expect(result).toBe(mapFn);
});

test('findByKey', () => {
  const mockFn = jest.fn();

  const spy = jest.spyOn(Mapper, 'find' as any);
  spy.mockImplementationOnce((...args) => {
    mockFn(...args);
  });

  Mapper['findByKey']({
    sourceType: 'type 1',
    destinationType: 'type 2',
  });

  expect(mockFn).toBeCalledWith('type 1', 'type 2');
});

describe('addProfile', () => {
  const mapFn1 = new MapFunction<any>(
    nameof<Class1>(),
    nameof<Class2>(),
    () => undefined,
  );
  const mapFn2 = new MapFunction<any>(
    nameof<Class2>(),
    nameof<Class1>(),
    () => undefined,
  );

  beforeEach(() => {
    Mapper['mapFunctions'] = [];
  });

  test('1 profiles', () => {
    Mapper.addProfile({
      get: () => [
        mapFn1,
      ],
    });

    expect(Mapper['mapFunctions'].length).toBe(1);
    expect(Mapper['mapFunctions'][0]).toBe(mapFn1);
  });

  test('2 profiles', () => {
    Mapper.addProfile({
      get: () => [
        mapFn1,
        mapFn2,
      ],
    });

    expect(Mapper['mapFunctions'].length).toBe(2);
    expect(Mapper['mapFunctions'][0]).toBe(mapFn1);
    expect(Mapper['mapFunctions'][1]).toBe(mapFn2);
  });

  test('exception', () => {
    expect(() => {
      Mapper.addProfile({
        get: () => [
          mapFn1,
          mapFn1,
        ],
      });
    }).toThrow();
  });
});

test('addProfiles', () => {
  const mapFn1 = new MapFunction<any>(
    nameof<Class1>(),
    nameof<Class2>(),
    () => undefined,
  );
  const mapFn2 = new MapFunction<any>(
    nameof<Class2>(),
    nameof<Class1>(),
    () => undefined,
  );

  const mockFn = jest.fn();

  const spy = jest.spyOn(Mapper, 'addProfile');
  spy.mockImplementation((...args) => {
    mockFn(...args);
  });

  Mapper['addProfiles']([
    { get: () => [mapFn1] },
    { get: () => [mapFn2] },
  ]);

  expect(mockFn).toHaveBeenCalledTimes(2);
  spy.mockClear();
});

describe('map', () => {
  const mapFn1 = new MapFunction<any>(
    nameof<Class1>(),
    nameof<Class2>(),
    (class1: Class1): Class2 => new Class2(class1.myProp),
  );
  const mapFn2 = new MapFunction<any>(
    nameof<Class2>(),
    nameof<Class1>(),
    (class2: Class2, class1?: Class1): Class1 => {
      if (class1) {
        class1.myProp = class2.yourProp;
        return class1;
      }

      return new Class1(class2.yourProp);
    },
  );

  beforeAll(() => {
    Mapper['mapFunctions'] = [
      mapFn1,
      mapFn2,
    ];
  });

  test('class 1 -> class 2', () => {
    const obj1 = new Class1('qwe');
    const result = Mapper.map<Class2>(
      nameof<Class1>(),
      nameof<Class2>(),
      obj1
    );

    expect(result instanceof Class2).toBe(true);
    expect(result.yourProp).toBe('qwe');
  });

  test('class 2 -> class 1', () => {
    const obj2 = new Class2('qqq');
    const result = Mapper.map<Class1>(
      nameof<Class2>(),
      nameof<Class1>(),
      obj2
    );

    expect(result instanceof Class1).toBe(true);
    expect(result.myProp).toBe('qqq');
  });

  test('class 2 -> existed class 1', () => {
    const obj1 = new Class1('ddd');
    const obj2 = new Class2('1234');
    const result = Mapper.map<Class1>(
      nameof<Class2>(),
      nameof<Class1>(),
      obj2,
      obj1
    );

    expect(result).toBe(obj1);
    expect(obj1.myProp).toBe('1234');
  });

  test('exception', () => {
    class Class3 {
    }

    expect(() => {
      Mapper.map<Class1>(
        nameof<Class3>(),
        nameof<Class1>(),
        {
          any: 123,
        },
      );
    }).toThrow();
  });
});
