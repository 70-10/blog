---
title: Hono で Dependency Injection
publishDate: 2024-02-19T02:58:37.220+09:00
tags: ["Develop"]
---

Hono で Dependency Injection をしたかったので、シンプルな DI コンテナを作りました。  
DI コンテナで管理する簡単なサービスとリポジトリの作成から、実際に DI コンテナで呼び出すところまでをまとめます。

# DIContainer クラス

Service/Repository のインスタンス化し管理する DIContainer クラスを作成します。

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

## 使い方

```ts
// DIコンテナで管理するオブジェクトの型宣言
interface DependencyTypes {
  UserRepository: IUserRepository;
  UserService: IUserService;
}

// DIコンテナの初期化
const diContainer = new DIContainer<DependencyTypes>();

// オブジェクトの登録
diContainer.register("UserRepository", UserRepository);
diContainer.register(
  "UserService",
  UserService,
  diContainer.get("UserRepository"),
);

// オブジェクトの取得
const userService = diContainer.get("UserService");
```

# 1. User / UserRepository / UserService を作成する

モデル、リポジトリ、サービスをそれぞれ作成します。  
今回はユーザー情報を返すだけのシンプルなものを用意します。

## User

ID と名前を持つシンプルな User クラスです。

```ts:user.ts
export class User {
  constructor(
    public id: number,
    public name: string,
  ) {}
}
```

## UserRepository

`findUser(id: number): User` を持つ UserRepository クラスと IUserRepository インターフェースです。  
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

`getUser(id: number): User` を持つ UserService クラスと IUserService インターフェースです。  
`getUser(id:number): User` は `UserRepository.findUser(id)` を呼び出します。

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

<!--
# 2. DI コンテナクラスを作成する

Service/Repository のインスタンス化し管理する DIContainer クラスを作成します。

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
``` -->

# 3. DI コンテナにクラスを登録する

DIContainer インスタンス生成をする際に、管理するものを型宣言しておく必要があります。  
今回は UserService, UserRepository の 2 つのみです。

```ts
interface DependencyTypes {
  UserRepository: IUserRepository;
  UserService: IUserService;
}

const diContainer = new DIContainer<DependencyTypes>();
```

`register` メソッドで UserRepository と UserService を登録します。

```ts
diContainer.register("UserRepository", UserRepository);
diContainer.register(
  "UserService",
  UserService,
  diContainer.get("UserRepository"),
);
```

## 完成形

```ts:di-config.ts
import { DIContainer } from "./di-container";
import { IUserRepository, UserRepository } from "./user-repository";
import { IUserService, UserService } from "./user-service";

export interface DependencyTypes {
  UserRepository: IUserRepository;
  UserService: IUserService;
}

const diContainer = new DIContainer<DependencyTypes>();

diContainer.register("UserRepository", UserRepository);
diContainer.register(
  "UserService",
  UserService,
  diContainer.get("UserRepository"),
);

export { diContainer };
```

# 4. Hono の Variables に DI コンテナをセットする

## HonoのVariablesの型を指定する

```ts:index.ts
const app = new Hono<{
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
  };
}>();
```

## ContextにSetしてどこからでも利用できるようにする

すべてのエンドポイントから利用できるように `context.set` で DI コンテナをセットします。

```ts
app.use("*", (c, next) => {
  c.set("diContainer", diContainer);
  return next();
});
```

DI コンテナを使うには `cotext.get` から取得します。

```ts
app.get("/users/:id", (c) => {
  const di = c.get("diContainer");
  const id = parseInt(c.req.param("id"));

  const userService = di.get("UserService");
  const user = userService.getUser(id);

  return c.json(user);
});
```

## 完成形

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

export default app;
```

# リポジトリ

今回作った DI コンテナを使ったサンプルは、以下のリポジトリにあります。

https://github.com/70-10/sandbox/tree/main/backend/hono/di-sample

# 参考情報

## Dependency Injection とは

https://ja.wikipedia.org/wiki/%E4%BE%9D%E5%AD%98%E6%80%A7%E9%80%86%E8%BB%A2%E3%81%AE%E5%8E%9F%E5%89%87

https://ja.wikipedia.org/wiki/%E4%BE%9D%E5%AD%98%E6%80%A7%E3%81%AE%E6%B3%A8%E5%85%A5

https://xtech.nikkei.com/it/free/ITPro/OPINION/20050216/156274/

## Hono で DI を利用する

https://zenn.dev/notahotel/articles/bb15e25cde6bf9
