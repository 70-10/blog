---
title: よく使う・これから使いたい MCP サーバー
publishDate: 2025-09-25T08:14:33.486+09:00
tags: ["Develop"]
description: ""
---

# よく使っている MCP サーバーのリスト

2025/09/25 時点で、私がよく使っている MCP サーバーのリストです。

## 1. [Context7](https://github.com/mcp/upstash/context7)

主要 OSS ライブラリの最新版・バージョン別ドキュメントや実行可能なコード例を取得し、LLM のプロンプトに直接注入できる MCP サーバー。

学習のカットオフによって古い書き方でコードが生成されてしまうのを防ぐために利用。

## 2. [Sequential-Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)

思考を段階として構造化し、分解→再検討→分岐→検証しながら問題解決を支援する MCP サーバー。
複雑な問題を小さなステップに分解し、途中での再考・修正や別経路への分岐を許容する。

課題が大きかったり曖昧すぎるときに、課題の問を分解することから始めたいときに利用。
曖昧な指示を出したときに勝手に考えさせて、それが間違っていないかどうかを確認するなどしている。

## 3. [Playwright](https://github.com/mcp/microsoft/playwright-mcp)

Playwright を使ってブラウザ操作を自動化する MCP サーバー。

作成したフロントエンドの UI の確認や動作検証に用いる。

## 4. [Serena](https://github.com/mcp/oraios/serena)

LSP (Language Server Protocol) を利用したセマンティックなコード検索・編集を LLM に提供する MCP サーバー。IDE のシンボル理解に相当する操作（参照関係の追跡、シンボル単位の挿入・置換など）をツール化する。

仕様の把握や影響範囲の調査をするときに、効率的にコードを読ませるために利用。

# これから試したい MCP サーバーのリスト

これから導入を考えている、まだ試していない MCP サーバーのリストです。

## 5. [Codex](https://github.com/openai/codex?tab=readme-ov-file)

OpenAI 製の AI コーディングエージェント。Codex 自身を MCP サーバーとして起動できる。

Claude Code から Codex を呼び出して、得意分野を任せるといった分業が可能になりそう。活用する記事がちらほら出てきていて、まだまだこれから発展しそうに見受けられる。

https://zenn.dev/rakko_inc/articles/f7ae8c9d035e16

## 6. [Chrome DevTools](https://developer.chrome.com/blog/chrome-devtools-mcp)

Chrome DevTools を MCP サーバーとして提供する。

Playwright MCP は動作の検証することが主となる。Chrome DevTools は LCP やネットワークなどの性能の調査に利用する。

1. まず Playwright MCP でユーザーフローを実行・チェック
2. 速度低下や不具合を検知したら、Chrome DevTools MCP で トレース取得 → 原因特定 → 改善提案

といった使い方ができそう。

## 7. [GitLab Knowledge Graph (GKG)](https://gitlab-org.gitlab.io/rust/knowledge-graph/)

「AI がコード書きすぎ問題には AI で立ち向かえ」で紹介されていた GitLab 製のプロジェクト内を探索して情報の関連性をグラフ化するツール。

https://speakerdeck.com/jyoshise/aigakodoshu-kisugiwen-ti-nihaaideli-tixiang-kae?slide=31

Serena と補完関係になってくれそう。  
GKG ので全体構造と影響候補を特定、Serena で安全に編集できそう。
