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


### package.json説明
- "eslint": "^5.5.0",
 eslintを使用
- "prettier": "^1.14.2"
 JavaScriptフォーマッタツール 
- "eslint-plugin-prettier": "^2.6.2",
 eslintのルールに適用したフォーマットを行う
- "eslint-config-airbnb": "^17.1.0",
 airbnbルール
- "eslint-plugin-import": "^2.14.0",
- "eslint-plugin-jsx-a11y": "^6.1.1",
- "eslint-plugin-react": "^7.11.1",
 airbnbを使用するために必要

 ### .eslintrc説明
- extends
 ルールの拡張
- rules
 自作ルール設定（ON/OFF) 



  