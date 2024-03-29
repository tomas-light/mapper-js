# mapper-js

Separates your models mapping for main logic.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/tomas-light/mapper-js/blob/HEAD/LICENSE)
[![npm latest package](https://img.shields.io/npm/v/@tomas-light/mapper-js/latest.svg)](https://img.shields.io/npm/v/@tomas-light/mapper-js/latest.svg)
[![codecov](https://codecov.io/github/tomas-light/mapper-js/branch/main/graph/badge.svg?token=NuAoioGPVD)](https://codecov.io/github/tomas-light/mapper-js)

## Installation
npm
```cmd
npm install @tomas-light/mapper-js
```
yarn
```cmd
yarn add @tomas-light/mapper-js
```

## How to use

You may defined your DTOs contracts as abstract classes and map them to your classes. It allows you use ref on class as unique key, and use such class only as a type
```ts
import { Mapper } from '@tomas-light/mapper-js';

abstract class UserDto {
  abstract date: string;
}
class User {
  date: Date;
}

Mapper.addMapFunctions(
  new MapFunction(UserDto, User, (dto) => {
    const user = new User();
    user.date = new Date(dto.date);
    return user;
  })
);

const userDto: UserDto = {
  date: '2023-02-15T13:20:48.794Z',
};

const mappedObj = Mapper.map(UserDto, User, userDto);
mappedObj.date.toISOString(); // same as userDto.date
```

If you can't use abstract classes for DTOs (for example you use type generation for GraphQL scheme), you may use symbols as key for your mapping functions

```ts
import { Mapper } from '@tomas-light/mapper-js';

const userDtoSymbol = Symbol('user dto');
const userInterfaceSymbol = Symbol('user interface');

const userDto = {
  date: '2023-02-15T13:20:48.794Z',
};

interface IUser {
  date: Date;
};

Mapper.addMapFunctions(
  new MapFunction<typeof userDto, IUser>(userDtoSymbol, userInterfaceSymbol, (dto) => ({
    date: new Date(dto.date),
  }))
);

const mappedObj = Mapper.map<typeof userDto, IUser>(userDtoSymbol, userInterfaceSymbol, dto);
mappedObj.date.toISOString(); // same as dto.date
```

You can find more examples in `mapper-js/src/Mapper.test.ts`

### Auto mapping

Here we have utility function to reduce boilerplate in your Map functions called `autoMap`.

```ts
import { Mapper, MapFunction, autoMap } from '@tomas-light/mapper-js';

abstract class UserDto {
  abstract name: string;
  abstract age: number;
  abstract children?: { name: string }[];
}

abstract class User {
  abstract name: string;
  abstract deleted: boolean;
}

const mapFunction = new MapFunction<UserDto, User>(UserDto, User, dto => {
  const user = autoMap(dto, {}, {
    ignore: ['age'],
  });
  return {
    deleted: true,
    ...user,
  };
});

const mapper = new Mapper();
mapper.addMapFunctions(mapFunction);

const dto: UserDto = {
  age: 23,
  name: 'Joe',
  children: [{name: 'Alex'}],
};
const user = mapper.map(UserDto, User, dto); // { name: 'Joe', deleted: true, }
```

Be aware, for correct type inference we recommend to add following rules to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

Here is a demo how `autoMap` works (it is a GIF):

![mapper-js demo](readme-images/mapper-js%20autoMap%20demo.gif)

#### Config options:

| Property                  | Description                                                                                                                                                                       |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `copyArrays?: true`       | If `true` nested *arrays* will be copied from source object                                                                                                                       |
| `copyObjects?: true`      | If `true` nested *objects* will be copied from source object                                                                                                                      |
| `select?: string[]`       | Object keys joined with dot (`.`). Responsible for which of properties will be mapped. If not specified, all properties will be mapped                                            |
| `ignore?: string[]`       | Object keys joined with dot (`.`). Responsible for which of properties should be skipped. It has higher priority over `select` option.                                            |
| `defaultValueIfUndefined` | Used as replacer for undefined values. If you have object `{ foo: 'my str', bar: undefined, zed: undefined }` => default value will be assigned to `bar` and `zed` properties     |
| `defaultValueIfNull`      | Used as replacer for null values. If you have object `{ foo: null, bar: 'something }` => default value will be assigned to `foo` property                                         |
| `defaultValueIfNullOrUndefined`      | Used as replacer for null and undefined values. If you have object `{ foo: 'my str', bar: null, zed: undefined }` => default value will be assigned to `bar` and `zed` properties |

If config does not include both `copyArrays` and `copyObjects`, only primitive types will be mapped.

You can find more examples in `mapper-js/src/autoMap.test.ts` and `mapper-js/src/autoMapDemo.test.ts`
