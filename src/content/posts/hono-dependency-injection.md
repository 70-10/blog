---
title: Hono で Dependency Injection
publishDate: 2024-02-19T02:58:37.220+09:00
tags: ["Develop"]
---

Hono で Dependency Injection をするためのシンプルな DIContainer クラスを作成します。

# 完成イメージ

完成形は Hono の Variables にセットされた DI コンテナから必要な Service などを取得し利用する。

```ts:index.ts
import { Hono } from "hono";
import { DependencyTypes, diContainer } from "./di-config";
import { DIContainer } from "./di-container";

const app = new Hono<{
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
  };
}>();

app.use("*", (c, next) => {
  c.set("diContainer", diContainer);
  return next();
});

app.get("/users/:id", (c) => {
  const di = c.get("diContainer");
  const id = parseInt(c.req.param("id"));

  const userService = di.get("UserService");
  const user = userService.getUser(id);

  return c.json(user);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
```

# 1. User / UserRepository / UserService を作成する

## User

ID と名前を持つシンプルな User クラスを用意します。

```ts:user.ts
export class User {
  constructor(
    public id: number,
    public name: string,
  ) {}
}
```

## UserRepository

`findUser(id: number): User` を持つ UserRepository クラスと IUserRepository インターフェースを用意します。  
`findUser(id: number): User` では引数で渡された ID を持つ User インスタンスを返します。

```ts:user-repository.ts
import { User } from "./user";

export interface IUserRepository {
  findUser(id: number): User;
}

export class UserRepository implements IUserRepository {
  findUser(id: number) {
    return new User(id, "test user");
  }
}
```

## UserService

`getUser(id: number): User` を持つ UserService クラスと IUserService インターフェースを用意します。  
`getUser(id:number): User` は`UserRepository.findUser(id)`を呼び出すだけのシンプルな処理です。

```ts:user-service.ts
import { User } from "./user";
import { IUserRepository } from "./user-repository";

export interface IUserService {
  getUser(id: number): User;
}

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  getUser(id: number) {
    return this.userRepository.findUser(id);
  }
}
```

# 2. DI コンテナクラスを作成する

```ts:di-container.ts
export class DIContainer<DependencyTypes> {
  private registry = new Map<
    keyof DependencyTypes,
    DependencyTypes[keyof DependencyTypes]
  >();

  register<Key extends keyof DependencyTypes, Args extends unknown[]>(
    key: Key,
    Constructor: new (...args: Args) => DependencyTypes[Key],
    ...args: Args
  ): void {
    const instance = new Constructor(...args);
    this.registry.set(key, instance);
  }

  get<K extends keyof DependencyTypes>(key: K): DependencyTypes[K] {
    const instance = this.registry.get(key);
    if (!instance) {
      throw new Error(`No instance found for key: ${String(key)}`);
    }
    return instance as DependencyTypes[K];
  }
}
```

# 3. DI コンテナにクラスを登録する

```ts:di-config.ts
import { DIContainer } from "./di-container";
import { IUserRepository, UserRepository } from "./user-repository";
import { IUserService, UserService } from "./user-service";

export interface DependencyTypes {
  UserRepository: IUserRepository;
  UserService: IUserService;
}

const diContainer = new DIContainer<DependencyTypes>();

// Register repositories
diContainer.register("UserRepository", UserRepository);

// Register services
diContainer.register(
  "UserService",
  UserService,
  diContainer.get("UserRepository"),
);

export { diContainer };
```

# 4. Hono の Variables に DI コンテナをセットする

```ts:index.ts
import { Hono } from "hono";
import { DependencyTypes, diContainer } from "./di-config";
import { DIContainer } from "./di-container";

const app = new Hono<{
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
  };
}>();

app.use("*", (c, next) => {
  c.set("diContainer", diContainer);
  return next();
});

app.get("/users/:id", (c) => {
  const di = c.get("diContainer");
  const id = parseInt(c.req.param("id"));

  const userService = di.get("UserService");
  const user = userService.getUser(id);

  return c.json(user);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
```

# 参考情報

## Dependency Injection とは

https://ja.wikipedia.org/wiki/%E4%BE%9D%E5%AD%98%E6%80%A7%E9%80%86%E8%BB%A2%E3%81%AE%E5%8E%9F%E5%89%87

https://ja.wikipedia.org/wiki/%E4%BE%9D%E5%AD%98%E6%80%A7%E3%81%AE%E6%B3%A8%E5%85%A5

https://xtech.nikkei.com/it/free/ITPro/OPINION/20050216/156274/

## Hono で DI を利用する

https://zenn.dev/notahotel/articles/bb15e25cde6bf9
