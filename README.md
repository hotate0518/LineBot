# READ ME

## 概要

DialogFlow と各種クライアントサービス（LINE 等）を連携する

## 実装方針

### services.js に以下のオブジェクトを登録する。

- name
  - サービス名
- assign
  - そのサービスからのリクエストだと判定するチェックメソッド
- service
  - サービスのメインロジック

### src/client フォルダ配下に、各種サービスを実装する。

### dialogflow.js 使用方法

require し、postDialogFlow()を使用することで、DialogFlow に質問を投げかけ、応答を得ることが可能
