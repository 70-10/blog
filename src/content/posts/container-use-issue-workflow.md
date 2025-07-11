---
title: container-use の Issue ワークフロー
publishDate: 2025-07-11T09:53:14.790+09:00
tags: ["Develop"]
description: ""
---

# Issue対応ワークフロー

Issue 対応における container-use の実践的な活用方法について説明します。このワークフローは、 main ブランチを汚さず、安全に AI エージェントと協働して開発を進めるための推奨手順です。

## 推奨ワークフロー

Issue 対応では以下の 5 ステップのワークフローを推奨します。

### 1. 作業用ブランチを切る

Issue 対応のための専用ブランチを作成します。

```bash
# mainブランチから作業用ブランチを作成
git checkout main
git pull origin main
git checkout -b feature/issue-123

# リモートにプッシュして追跡設定
git push -u origin feature/issue-123
```

### 2. container-use で作業環境をつくる

AI エージェントが Issue 対応のために使用する隔離された環境を作成します。

```bash
# container-useのMCPサーバーを起動
container-use stdio
```

AI エージェントに以下のように指示します。

> Issue #123 の対応を行ってください。[具体的な要件やタスクの説明]

### 3. container-use 内で作業をする

AI エージェントが隔離された環境内で作業を進めます。この段階では以下のコマンドで進捗を監視できます。

```bash
# 作業環境の一覧を確認
container-use list

# リアルタイムで作業を監視
container-use watch <env-name>

# 作業ログを確認
container-use log <env-name>

# 変更されたファイルを確認
container-use diff <env-name>
```

### 4. 完了した内容を作業用ブランチにマージする

AI エージェントの作業が完了したら、作業用ブランチに結果をマージします。

```bash
# 作業内容を確認
container-use diff <env-name>

# 作業用ブランチにマージ
container-use merge <env-name>

# 環境を削除（オプション）
container-use delete <env-name>
# またはマージと同時に削除
container-use merge -d <env-name>
```

### 5. 作業用ブランチをリモートにプッシュする

変更内容をリモートリポジトリにプッシュして、プルリクエストを作成します。

```bash
# 変更をリモートにプッシュ
git push origin feature/issue-123

# プルリクエストを作成（GitHub CLIを使用する場合）
gh pr create --title "Fix issue #123" --body "Issue #123 の対応を完了"
```

## 実践例

### 例：バグ修正のケース

```bash
# 1. 作業用ブランチを作成
git checkout main
git checkout -b bugfix/login-validation
git push -u origin bugfix/login-validation

# 2. container-useを起動
container-use stdio

# 3. AIエージェントに指示
# "Login validation bug (Issue #456) を修正してください。
#  ユーザー名が空の場合のエラーハンドリングを追加する必要があります。"

# 4. 作業を監視
container-use watch brave-penguin

# 5. 作業完了後、内容を確認
container-use diff brave-penguin
container-use log brave-penguin

# 6. 作業用ブランチにマージ
container-use merge -d brave-penguin

# 7. リモートにプッシュ
git push origin bugfix/login-validation
```

## このワークフローの利点

### 1. 安全性

- **mainブランチの保護**: 直接 main ブランチを変更することなく、作業用ブランチで安全に開発
- **隔離された環境**: AI エージェントの作業がローカル環境に影響しない
- **レビュー可能**: プルリクエストを通じて変更内容を確認・承認

### 2. 効率性

- **並行作業**: 複数の Issue を同時に異なる環境で対応可能
- **迅速な反復**: 失敗した場合も環境を削除して即座に再開
- **履歴の追跡**: 全ての作業過程が記録される

### 3. チーム開発

- **一貫性**: 全チームメンバーが同じワークフローを使用
- **透明性**: 作業内容が Git の履歴として明確に記録
- **コラボレーション**: プルリクエストを通じたコードレビュー

## よくある質問

### Q: 作業用ブランチを作らずに直接mainブランチで作業できますか？

A: 技術的には可能ですが、推奨しません。作業用ブランチを使用することで以下の利点があります。

- 実験的な変更が他の開発者に影響しない
- プルリクエストを通じてコードレビューが可能
- 問題が発生した場合の復旧が容易

### Q: 複数のIssueを同時に対応できますか？

A: はい、各 Issue ごとに別の作業用ブランチと container-use 環境を作成することで、複数の Issue を並行して対応できます。

```bash
# Issue #123用
git checkout -b feature/issue-123
# container-use環境1で作業

# Issue #456用
git checkout -b feature/issue-456
# container-use環境2で作業
```

### Q: AIエージェントの作業が期待通りでない場合はどうしますか？

A: 以下の選択肢があります。

1. **継続して改善**: 同じ環境で追加の指示を与える
2. **環境の削除**: `container-use delete <env-name>` で環境を削除し、新しいアプローチで再開
3. **手動での修正**: `container-use checkout <env-name>` で内容を確認し、手動で修正

### Q: 作業用ブランチはいつ削除すればよいですか？

A: プルリクエストがマージされた後に削除することを推奨します。

```bash
# プルリクエストマージ後
git checkout main
git pull origin main
git branch -d feature/issue-123
git push origin --delete feature/issue-123
```

## 関連コマンド

| コマンド                            | 用途                   |
| ----------------------------------- | ---------------------- |
| `container-use list`                | 環境の一覧表示         |
| `container-use log <env-name>`      | 作業履歴の確認         |
| `container-use diff <env-name>`     | 変更内容の確認         |
| `container-use watch <env-name>`    | リアルタイム監視       |
| `container-use terminal <env-name>` | 環境内でのシェル起動   |
| `container-use checkout <env-name>` | 環境内容のローカル確認 |
| `container-use merge <env-name>`    | 現在のブランチにマージ |
| `container-use delete <env-name>`   | 環境の削除             |

## 次のステップ

このワークフローを使用して container-use での開発に慣れたら、以下の高度な使用方法も検討してください。

- 複数の AI エージェントを使った並行開発
- 環境の共有とチーム内での協働
- CI/CD パイプラインとの統合

より詳細な情報については、[Managing Environments](managing-environments.mdx)ドキュメントを参照してください。
