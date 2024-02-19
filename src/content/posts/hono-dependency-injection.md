---
title: Hono で Dependency Injection する
publishDate: 2024-02-19T23:28:37.220+09:00
tags: ["Develop"]
---

Hono で Dependency Injection をしたかったので、シンプルな DI コンテナを作りました。

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

UserService と UserRepository を登録して利用する例です。

```ts
import { DIContainer } from "./di-container";

interface User {
  id: number;
  name: string;
}

interface IUserRepository {
  findUser(id: number): User;
}

class UserRepository implements IUserRepository {
  findUser(id: number) {
    return {
      id,
      name: `User${id}`,
    } satisfies User;
  }
}

interface IUserService {
  getUser(id: number): User;
}

class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  getUser(id: number) {
    return this.userRepository.findUser(id);
  }
}

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

// オブジェクトの利用
const userService = diContainer.get("UserService");
console.log(userService.getUser(1)); // { id: 1, name: "User1" }
```

# Hono で使う

DIContainer を Hono で使えるようにします。  
[Context の set()/get()](https://hono.dev/api/context#set-get) を通じて DIContainer へアクセスします。

## 1. Variables に DIContainer を指定する

Hono の Variables の型に DIContainer を指定します。

```ts
const app = new Hono<{
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
  };
}>();
```

## 2. `context.set()` でどこからでもアクセスできるようにする

すべてのエンドポイントからアクセスできるように `context.set()` で DIContainer をセットします。

```ts
app.use("*", (c, next) => {
  c.set("diContainer", diContainer);
  return next();
});
```

DIContainer を使うには `cotext.get()` から取得します。

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
import { DIContainer } from "./di-container";

interface User {
  id: number;
  name: string;
}

interface IUserRepository {
  findUser(id: number): User;
}

class UserRepository implements IUserRepository {
  findUser(id: number) {
    return {
      id,
      name: `User${id}`,
    } satisfies User;
  }
}

interface IUserService {
  getUser(id: number): User;
}

class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  getUser(id: number) {
    return this.userRepository.findUser(id);
  }
}

interface DependencyTypes {
  UserRepository: IUserRepository;
  UserService: IUserService;
}

const diContainer = new DIContainer<DependencyTypes>();

diContainer.register("UserRepository", UserRepository);
diContainer.register("UserService", UserService, diContainer.get("UserRepository"));

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

## リポジトリ

今回作った DI コンテナを使ったサンプルは、以下のリポジトリにあります。

https://github.com/70-10/sandbox/tree/main/backend/hono/di-sample

# 参考情報

## Dependency Injection とは

https://ja.wikipedia.org/wiki/%E4%BE%9D%E5%AD%98%E6%80%A7%E9%80%86%E8%BB%A2%E3%81%AE%E5%8E%9F%E5%89%87

https://ja.wikipedia.org/wiki/%E4%BE%9D%E5%AD%98%E6%80%A7%E3%81%AE%E6%B3%A8%E5%85%A5

https://xtech.nikkei.com/it/free/ITPro/OPINION/20050216/156274/

## Hono で DI を利用する

https://zenn.dev/notahotel/articles/bb15e25cde6bf9
