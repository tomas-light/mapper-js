import { autoMap } from './autoMap';

describe('use cases', () => {
  const userSource = () => ({
    name: 'Joe',
    age: 34,
    married: false,
    id: Symbol('unique id'),
    children: ['Paul', 'Eva'],
    education: {
      high: true,
      master: false,
    },
  });

  test('if only primitives are copied with empty config', () => {
    const user = userSource();
    const newUser = autoMap(user, {}, {});
    expect(newUser).toEqual({
      name: user.name,
      age: user.age,
      married: user.married,
      id: user.id,
    });
  });

  test('if we can ignore some properties with config', () => {
    const user = userSource();
    const newUser = autoMap(user, {}, {ignore: ['married', 'id']});
    expect(newUser).toEqual({
      name: user.name,
      age: user.age,
    });
  });

  test('if we can choose, which of properties should be mapped with config', () => {
    const user = userSource();
    const newUser = autoMap(user, {}, {select: ['id', 'education.high'], copyObjects: true});
    expect(newUser).toEqual({
      id: user.id,
      education: {
        high: user.education.high,
      },
    });
  });

  test('if we can copy nested objects and array with config', () => {
    const user = userSource();
    const newUser = autoMap(user, {}, {
      select: ['education', 'children'],
      copyObjects: true,
      copyArrays: true,
    });
    expect(newUser).toEqual({
      education: user.education,
      children: user.children,
    });
  });

  test('if we can copy nested objects with config (very deep)', () => {
    const deepObjects = {
      level1: {
        check: true,
        level22: {
          foo: '1',
        },
        level2: {
          bar: '2',
          level31: {
            bar3: false,
          },
          level3: {
            zax: 3,
            level4: {
              cosmo: null,
            },
          },
        },
      },
    };
    const newUser = autoMap(deepObjects, {}, {
      select: ['level1.level2.bar', 'level1.level2.level3.zax', 'level1.level2.level3.level4'],
      copyObjects: true,
      copyArrays: true,
    });
    expect(newUser).toEqual({
      level1: {
        level2: {
          bar: '2',
          level3: {
            zax: 3,
            level4: {
              cosmo: null,
            },
          },
        },
      },
    });
  });

  test('if ignore has more priority than select', () => {
    const zoo = {
      name: 'My Zoo',
      animals: {
        catsCount: 3,
        haveDogs: false,
        birds: ['sparrow', 'kiwi'],
      },
      employees: {
        cleaning: ['Joe'],
        sellers: {
          Suzie: {
            age: 23,
            position: 'manager',
            staffDiscount: {
              forChildren: true,
              forHusband: false,
            },
          },
        },
      },
    };

    const newZoo = autoMap(
      zoo,
      {},
      {
        select: ['employees.sellers.Suzie'],
        ignore: ['employees.sellers.Suzie.position'],
        copyObjects: true,
        copyArrays: true,
      }
    );

    expect(newZoo).toEqual({
      employees: {
        sellers: {
          Suzie: {
            age: 23,
            staffDiscount: {
              forChildren: true,
              forHusband: false,
            },
          },
        },
      },
    } satisfies typeof newZoo);
  });
});

test('if it is a new object', () => {
  const source = {some: 'qqq'};
  const destination = autoMap(source, {}, {});
  expect(destination).not.toBe(source);
});

describe('if primitive properties are mapped', () => {
  const symbol = Symbol('any custom symbol');
  const source = {
    stringProperty: 'qqq',
    numberProperty: 123,
    booleanProperty: true,
    undefinedProperty: undefined,
    symbolProperty: symbol,
  };
  const destination = autoMap(source, {}, {});

  test('string property is mapped', () => {
    expect(destination.stringProperty).toBe('qqq');
  });
  test('number property is mapped', () => {
    expect(destination.numberProperty).toBe(123);
  });
  test('boolean property is mapped', () => {
    expect(destination.booleanProperty).toBe(true);
  });
  test('undefined property is mapped', () => {
    expect('undefinedProperty' in destination).toBeTruthy();
    expect(destination.undefinedProperty).toBe(undefined);
  });
  test('symbol property is mapped', () => {
    expect(destination.symbolProperty).toBe(symbol);
  });
});

describe('if object properties are mapped', () => {
  const array = ['item 1', 'item 2', 'item 3'];
  const source = {
    nullProperty: null,
    arrayProperty: array,
  };
  const destination = autoMap(source, {}, {copyObjects: true, copyArrays: true});

  test('null property is mapped', () => {
    expect(destination.nullProperty).toBe(null);
  });
  test('array property is mapped', () => {
    expect(destination.arrayProperty).toEqual(['item 1', 'item 2', 'item 3']);
  });
  test('array property is mapped to new array', () => {
    expect(destination.arrayProperty).not.toBe(array);
  });

  describe('nested objects', () => {
    const source = {
      some: {
        stringProperty: 'qqq',
      },
      another: {
        numberProperty: 444,
      },
    };

    const destination = autoMap(source, {}, {copyObjects: true});

    test('nested objects has different refs', () => {
      expect(destination.some).not.toBe(source.some);
      expect(destination.another).not.toBe(source.another);
    });

    test('nested objects are fully copied', () => {
      expect(destination.some.stringProperty).toBe(source.some.stringProperty);
      expect(destination.another.numberProperty).toBe(source.another.numberProperty);
    });
  });
});

test('filled destination', () => {
  const obj1 = {
    prop1: 'qqq',
    prop2: 123,
  };
  const obj2 = {
    prop2: 444,
    prop3: '345',
  };

  const result = autoMap(obj1, obj2, {});
  expect(result).toBe(obj2);

  const obj1And2 = obj2 as typeof obj1 & typeof obj2;

  expect(obj1And2.prop1).toBe('qqq');
  expect(obj1And2.prop2).toBe(123);
  expect(obj1And2.prop3).toBe('345');
});

test('empty destination', () => {
  const source = {
    prop1: 'qqq',
  };

  const destination = autoMap(source, {}, {});
  expect(destination).not.toBe(source);
  expect(destination.prop1).toBe('qqq');
});
