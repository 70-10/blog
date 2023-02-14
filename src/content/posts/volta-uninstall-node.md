---
title: VoltaでNodeをアンインストールする
publishDate: 2021-09-29T11:02+09:00
tags: ["Node.js"]
draft: false
---

Node.js のバージョン管理システムの[Volta](https://volta.sh)を使っています。  
Volta の CLI に[`uninstall`コマンド](https://docs.volta.sh/reference/uninstall)が用意されていますが、Node.js のアンインストールは 2021/09/29 現在サポートされていません。

GitHub の Issue を見ると、ワークアラウンドとして所定のディレクトリを削除することでアンインストールできます。

# Node.js のアンインストール方法（ワークアラウンド）

- Linux, Mac: `~/.volta/tools/image/node/<バージョン>`のディレクトリを削除
- Windows : `%LOCALAPPDATA%\Volta\tools\image\node\<バージョン>`のディレクトリを削除

### 例）Mac で v16.9.1 をアンインストールする

```
» volta list node
⚡️ Node runtimes in your toolchain:

    v14.17.6
    v16.9.1
    v16.10.0 (default)

» rm -rf ~/.volta/tools/image/node/16.9.1/

» volta list node
⚡️ Node runtimes in your toolchain:

    v14.17.6
    v16.10.0 (default)
```

# 参考 URL

- [volta uninstall | Volta](https://docs.volta.sh/reference/uninstall)
- [Unclear how to remove Node.js version · Issue #855 · volta-cli/volta](https://github.com/volta-cli/volta/issues/855)
- [Support `volta uninstall` for node and yarn · Issue #327 · volta-cli/volta](https://github.com/volta-cli/volta/issues/327)
