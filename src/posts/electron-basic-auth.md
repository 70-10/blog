---
title: ElectronでBasic認証の処理をする
publishDate: 2018-10-31T23:21+09:00
tags: ["Electron"]
---

# はじめに

Electron で Basic 認証を処理するための実装についての知見をまとめます。

# `login`イベントで Basic 認証を検知する

Electron では Basic 認証が求められるページへアクセスすると`login`イベントが発火します。  
`login`イベントの引数`callback`にユーザーとパスワードを渡すと Basic 認証処理が行われます。

## main.js

```javascript
const { app } = require("electron");

let win;

app.on("ready", () => {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile("index.html");
});

app.on("login", (event, webContents, request, authInfo, callback) => {
  callback("user", "password");
});
```

## index.html

メインウィンドウの index.html では`webview`を使い、Basic 認証を返すページを表示します。  
（ここでは例として`http://localhost:3000`を指定しています）

```html
<body>
    <webview id="browse" src="http://localhost:3000"></webview>
</body>
```

# ユーザーから入力できるようにする

## main.js

callback は一時的に保持し、ユーザー・パスワードを入力する画面 auth.html をサブウィンドウとして表示します。

```javascript
const { app, BrowserWindow } = require("electron");

let win;
let loginCallback;
let subWindow;

app.on("ready", () => {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile("index.html");
});

app.on("login", (event, webContents, request, authInfo, callback) => {
  event.preventDefault();
  subWindow = new BrowserWindow({
    parent: win,
    modal: true
  });
  subWindow.loadFile("auth.html");
  loginCallback = callback;
});
```

## auth.html

```html
<body>
  <h1>Auth</h1>
  <label>username</label>
  <input type="text" id="username" class="input">

  <label>Password</label>
  <input type="password" id="password" class="input">

  <button id="auth">送信</button>
</body>
```

# ユーザーからの入力を取得する

## auth.html

ipc を使って auth.html からユーザー・パスワードを送信します。

```html
<body>
  <h1>Auth</h1>
  <label>username</label>
  <input type="text" id="username" class="input">

  <label>Password</label>
  <input type="password" id="password" class="input">

  <button id="auth" onclick="submit()">送信</button>
  <script type="text/javascript">
    const { ipcRenderer } = require("electron");
    function submit() {
      const username = document.querySelector("#username").value;
      const password = document.querySelector("#password").value;
      ipcRenderer.send("authorization", { username, password })
    }
  </script>
</body>
```

## main.js

ipc から取得したユーザー・パスワードを一時保持していた callback に渡して処理し、サブウィンドウを閉じます。

```javascript
const { app, BrowserWindow, ipcMain } = require("electron");

let win;
let loginCallback;
let subWindow;

app.on("ready", () => {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile("index.html");
});

app.on("login", (event, webContents, request, authInfo, callback) => {
  event.preventDefault();
  subWindow = new BrowserWindow({
    parent: win,
    modal: true
  });
  subWindow.loadFile("auth.html");
  loginCallback = callback;
});

ipcMain.on("authorization", (event, arg) => {
  loginCallback(arg.username, arg.password);
  subWindow.close();
});
```

# おわりに

上記をまとめると、

1. app の`login`イベントでBasic認証の検知
2. サブウィンドウでユーザー・パスワード入力画面を表示
3. 入力された情報を ipc 通信でやり取りする
4. ipc通信で受け取った入力情報を`callback`に渡す

この4つの流れでBasic認証の処理ができるようになります。

# 参考ページ

- [サンプルアプリ](https://github.com/70-10/sandbox/tree/master/node/electron/basic-auth)
- [Electron Documentation: app](https://electronjs.org/docs/api/app#event-login)
