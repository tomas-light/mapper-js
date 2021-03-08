# mapper-js
JavaScript dependency injection like Autofac in .Net

## How to use

`MenuService.js`
```js
import { Mapper } from 'mapper-js';

export class MenuService {
  update(menu) {
    const entity = Mapper.map(
      'Menu',
      'MenuEntity',
      menu
    );

    const menuEntity = this.db.update(entity);
  }
}
```

or with Typescript:

`MenuService.ts`
```ts
import { Mapper } from 'mapper-js';
import { MenuEntity } from './MenuEntity';
import { Menu } from './Menu';

export class MenuService {
  update(menu: Menu) {
    const entity = Mapper.map<MenuEntity>(
      nameof<Menu>(),
      nameof<MenuEntity>(),
      menu
    );

    const menuEntity = this.db.update(entity);
  }
}
```

P.S. `nameof` in example from `ts-nameof` package (here https://www.npmjs.com/package/ts-nameof)

## How to configure

You have an interface and its implementation

`Menu.ts`
```ts
export interface Menu {
  id: number;
  name?: string;
  createDate: Date;
  lastUpdate: Date;
  author?: User;
  dishes?: DishInMenu[];
}
```

`MenuEntity.ts`
```ts
export interface MenuEntity {
  id: number;
  create_date: string;
  last_update: string;
  author_id?: number;
  name?: string;
}
```

Add mapping profile for your models

`EntityMappingProfile.js`
```js
import { MapFunction, MappingProfile, MappingProfileBase } from 'mapper-js';
import { MenuEntity } from './MenuEntity';
import { Menu } from './Menu';

export class EntityMappingProfile extends MappingProfileBase {
  get() {
    return [
      new MapFunction(
        'Menu',
        'MenuEntity',
        EntityMappingProfile.mapMenuToMenuEntity
      ),
      new MapFunction(
        'MenuEntity',
        'Menu',
        EntityMappingProfile.mapMenuEntityToMenu
      ),
    ];
  }

  private static mapMenuToMenuEntity(menu) {
    return {
      id: menu.id,
      create_date: menu.createDate.toISOString(),
      last_update: menu.lastUpdate.toISOString(),
      author_id: menu.author?.id,
      name: menu.name,
    }
  }

  private static mapMenuEntityToMenu(entity) {
    return {
      id: entity.id,
      createDate: new Date(entity.create_date),
      lastUpdate: new Date(entity.last_update),
      name: entity.name,
    }
  }
}
```

or with Typescript

`EntityMappingProfile.ts`
```ts
import { MapFunction, MappingProfile, MappingProfileBase } from 'mapper-js';
import { MenuEntity } from './MenuEntity';
import { Menu } from './Menu';

export class EntityMappingProfile extends MappingProfileBase implements MappingProfile {
  get(): MapFunction[] {
    return [
      new MapFunction(
        nameof<Menu>(),
        nameof<MenuEntity>(),
        EntityMappingProfile.mapMenuToMenuEntity
      ),
      new MapFunction(
        nameof<MenuEntity>(),
        nameof<Menu>(),
        EntityMappingProfile.mapMenuEntityToMenu
      ),
    ];
  }

  private static mapMenuToMenuEntity(menu: Menu): MenuEntity {
    return {
      id: menu.id,
      create_date: menu.createDate.toISOString(),
      last_update: menu.lastUpdate.toISOString(),
      author_id: menu.author?.id,
      name: menu.name,
    }
  }

  private static mapMenuEntityToMenu(entity: MenuAttributes): Menu {
    return {
      id: entity.id,
      createDate: new Date(entity.create_date),
      lastUpdate: new Date(entity.last_update),
      name: entity.name,
    }
  }
}
```

After that, register your profiles in Mapper. Don't forget to call this function in your entrypoint file.

`configureMapper.ts`
```ts
import { Mapper } from 'mapper-js';
import { EntityMappingProfile } from './EntityMappingProfile';

export function configureMapper() {
  Mapper.addProfiles([
    new EntityMappingProfile(),
  ]);
}
```

You can see more examples in `mapper-js/src/Mapper.test.ts`
