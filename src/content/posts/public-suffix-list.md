---
title: Public Suffix List を知る
publishDate: 2025-05-02T08:04:34.406+09:00
tags: ["Develop"]
description: "Public Suffix List（PSL）とは何か、なぜそれが必要なのかを解説。eTLD（effective Top Level Domain）の概念と、なぜドメイン管理にPSLが重要なのかを説明しています。"
---

## Public Suffix List とはドメインのリストである

Wikipedia の Public Suffix List の説明文は以下のように書かれています。

> Public Suffix List (PSL)は、ドメインのリストである。このリスト上の項目は、effective top-level domains (eTLD)と呼ばれる。

https://ja.wikipedia.org/wiki/Public_Suffix_List

Public Suffix List とは、**eTLD と呼ばれるドメインのリスト**です。  
この説明、 eTLD を理解していないと Public Suffix List を十分に理解できません。Public Suffix List を知る前に eTLD とは何かを知る必要があります。

## eTLD とは

MDN Web Docs の eTLD の説明を見てみましょう。

> The term eTLD stands for "effective top-level domain" and is a domain under which domains can be registered by a single organization.
>
> A top level domain (TLD) is the part of the domain name following the final dot: so for example, the top-level domain in `crookedtimber.org` is `org`.

> （翻訳）  
> _eTLD (effective Top Level Domain) とは**実質的な TLD (Top Level Domain)** を意味し、単一の組織がその直下にドメインを登録できる階層を指します。_  
> _トップレベルドメイン（TLD）は、ドメイン名の最後のドットの後ろの部分です。たとえば `crookedtimber.org` の場合、トップレベルドメインは `org` です。_

https://developer.mozilla.org/en-US/docs/Glossary/eTLD

TLD は簡単ですね。つまり、このブログのドメイン、 `blog.70-10.net` だと `net` のことです。  
ただ、eTLD の説明はいまいちピンときません。「単一の組織がその直下にドメインを登録できる階層」とはどういうことでしょう。

ひとまず、もう少しドキュメントを読み進めてみましょう。

## TLD だけでは不十分なケースのために eTLD がある

MDN Web Docs に、TLD だけを基準にするのは問題であることが記述されています。

> Suppose only domains directly under top-level domains were registrable by single organizations. Then you would know that the following domains all belonged to the same organization:
>
> ```
>     xyz.org
> abc.xyz.org
> def.xyz.org
> ```
>
> However, this does not work as a general rule, because many registrars allow organizations to register domains at levels below the top level. This means that, for example, `sussex.ac.uk` and `aber.ac.uk` are owned by different organizations.

> （翻訳）  
> _仮に、トップレベルドメインの直下にあるドメインだけが、単一の組織によって登録できるとしましょう。すると、次に挙げるドメインはすべて同じ組織に属していると判断できます。_
>
> ```
>     xyz.org
> abc.xyz.org
> def.xyz.org
> ```
>
> _しかし、これは一般的なルールとしては成り立ちません。多くのレジストラは、トップレベルより下の階層でも組織にドメインを登録させることを許可しているためです。つまり、たとえば `sussex.ac.uk` と `aber.ac.uk` は、それぞれ別々の組織が所有していることになります。_

TLD のひとつである `uk` では、`ac.uk` が、大学などの組織がドメインを登録する際の基点となっています。その結果、`sussex.ac.uk` と `aber.ac.uk` は異なる組織によって所有・管理されています。  
もし TLD (`uk`) だけを見てしまうと、これらが同じ組織に属することとなってしまいます。  
日本の `.jp` ドメインでも同様です。TLD は `jp` ですが、`co.jp`（企業向け）や `ac.jp`（大学等向け）のような TLD の下のレベルでドメインが登録・管理されます。`example.co.jp` と `example.ac.jp` は異なる組織です。

Web ブラウザが Cookie の適用範囲などセキュリティポリシーを決める場合を考えましょう。もし TLD だけを基準とすると、別々の組織が管理しているドメインを同一組織と誤認し、Cookie が誤って共有されるなどのセキュリティリスクが生じます。  
TLD だけでなく、`.ac.uk` や `.co.jp` のような実質的にドメイン登録の基点となる、公開されたドメイン名の末尾部分（サフィックス）を正確に識別する必要があります。これが eTLD の概念です。

では、ドキュメントの最初の説明に戻りましょう。

> eTLD (effective Top Level Domain) とは**実質的な TLD (Top Level Domain)** を意味し、単一の組織がその直下にドメインを登録できる階層を指します。

さきほどよりも説明が入ってきますね。  
つまり、超シンプルにいうと、「eTLD とは `net` や `jp` のような TLD であり、また `co.jp` や `ac.jp` である」ということです。

## eTLD はアルゴリズムで判断できない

どの部分までが、eTLD であるかは、国や地域、ドメインの種類によって様々です。各 TLD を管理するレジストリやその指定事業者のポリシーによって定められています。  
`.jp` ドメインでは、`co.jp` や `ac.jp` の他に、都道府県名を用いた `tokyo.jp` や `東京.jp` なども eTLD として扱われます。

世界中に様々なポリシーが存在するため、「ドットで区切って右から何番目までが eTLD」といった単純なアルゴリズムで全ての eTLD を正確に判定することは困難なのです。

## ここでようやく Public Suffix List のご登場

Wikipedia の Public Suffix List の説明文に戻ります。

> Public Suffix List (PSL)は、ドメインのリストである。このリスト上の項目は、effective top-level domains (eTLD)と呼ばれる。

最初に書いたように、Public Suffix List とは、**eTLD と呼ばれるドメインのリスト**です。eTLD がアルゴリズムで判断できないがためにリストとして管理しているのでした。

https://publicsuffix.org/

実際のリストは GitHub 上で管理されています。

https://github.com/publicsuffix/list

### Appendix: Public Suffix = eTLD ?

「Public Suffix List は eTLD と呼ばれるドメインのリスト」と定義づけられるなら、「Public Suffix は eTLD である」とも言えるはずです。  
"Public Suffix List" ではなく "eTLD List" でも良いのではないか？という疑問も残ります。

このことは、RFC 6265 改訂版の Internet-Draft の "draft-ietf-httpbis-rfc6265bis" で触れられています。

> The term "public suffix" is defined in a note in Section 5.3 of
> [RFC6265] as "a domain that is controlled by a public registry", and
> are also know as "effective top-level domains" (eTLDs).

> （翻訳）  
> _「public suffix」という用語は、[RFC6265] の 5.3 節の注釈で「公開レジストリによって管理されているドメイン」と定義されており、eTLD (effective top-level domains) とも呼ばれています。_

https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-02

このことから、 Public Suffix = eTLD と言って良いと考えられます。  
ただし、 eTLD という語句について定義している RFC は存在しません。Public Suffix と表現するほうが正確であると思われます。  
ゆえに、"Public Suffix List" という名称が使われているのでしょう。
