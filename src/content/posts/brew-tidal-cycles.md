---
title: HomebrewでTidalCyclesをインストールする
publishDate: 2019-01-05T23:50:00+09:00
tags: ["Develop"]
draft: false
---

# はじめに

[演奏するプログラミング、ライブコーディングの思想と実践](https://www.amazon.co.jp/dp/4802511043/)を読み始めました。  
Chapter 3 の TidalCycles インストールでつまずいたので、その内容と解決方法をまとめます。

## 本に記載されているインストール方法

[tidalcycles/tidal-bootstrap](https://github.com/tidalcycles/tidal-bootstrap)の[tidal-bootstrap.command](https://github.com/tidalcycles/tidal-bootstrap/blob/master/tidal-bootstrap.command)を実行します。  
tidal-bootstrap.command は Homebrew 経由でのアプリケーションのインストール＋必要な Haskell のモジュールのインストールを行うスクリプトです。

## 実行環境

Mac で OS は Mojave (10.14.1) を使用しています。

# `haskell-platform`のインストールでエラーが起きた

TidalCycles をインストールするには ghci が必要です。  
tidal-bootstrap.command は brew-cask 経由で `haskell-platform` のインストールを試みます。  
ですが、`haskell-platform`は存在しておらず、ここでエラーとなって終了します。

```
» ./tidal-bootstrap.command
.
.
.
Installing: ghci
Updating Homebrew...
Fast-forwarded master to origin/master.
==> Auto-updated Homebrew!
Updated 1 tap (homebrew/core).
==> Updated Formulae
recutils

Error: Cask 'haskell-platform' is unavailable: No Cask with this name exists.
Could not install haskell-platform quitting.
```

## cask を使わずに`haskell-platform`をインストールしてみると

```
» brew install haskell-platform
Updating Homebrew...
Error: No available formula with the name "haskell-platform"
We no longer package haskell-platform. Consider installing ghc,
cabal-install and stack instead:
  brew install ghc cabal-install stack
```

Homebrew にも`haskell-platform`は存在しておらず、代わりに`brew install ghc cabal-install stack`を実行してくださいと表示されます。

# 回避方法

[tidal-bootstrap.command](https://github.com/tidalcycles/tidal-bootstrap/blob/master/tidal-bootstrap.command)を実行する前に `brew install ghc cabal-install stack` で Haskell をインストールします。  
そうすることで、TidalCycles を正常にインストールできます。

# おわりに

Homebrew での Haskell のインストール方法が変わっており、tidal-bootstrap.command が正しく実行できませんでした。  
[tidalcycles/tidal-bootstrap](https://github.com/tidalcycles/tidal-bootstrap) は 2018 年 6 月にコミットが行われたきり更新されていません。積極的にアップデートするような気配は無さそうです。

そして、[演奏するプログラミング、ライブコーディングの思想と実践](https://www.amazon.co.jp/dp/4802511043/)がかなり面白いです。Sonic Pi でのライブコーディング楽しいです。
