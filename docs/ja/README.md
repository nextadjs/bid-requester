# @nextad/bid-requester

OpenRTB version 2.5/2.6/3.0 に準拠した TypeScript 入札リクエスターライブラリ。

## 特徴

- 🎯 完全な TypeScript 型定義のサポート
- 📝 OpenRTB 仕様準拠
- 🛠️ ESM と CommonJS のサポート
- ⚡ インスタンス化せずに利用可能
- 🧪 テストに便利なインターフェース

## インストール

npm:

```
npm install @nextad/bid-requester iab-openrtb
```

pnpm:

```
pnpm add @nextad/bid-requester iab-openrtb
```

## 使い方

### 基本的な使い方

```typescript
import { bidRequester } from "@nextad/bid-requester";
import { BidRequest, BidResponse } from "iab-openrtb/v26";

const bidRequest: BidRequest = {
  id: "bid-request-1",
  imp: [
    {
      id: "1",
      banner: {
        w: 300,
        h: 250,
      },
    },
  ],
};

const bidResponse = await bidRequester.requestV26(
  "https://example.com/endpoint",
  bidRequest
);
```

### バージョンごとの入札リクエスト

```typescript
const bidResponseV25 = await bidRequester.requestV25(
  "https://example.com/v25",
  bidRequestV25
);
const bidResponseV26 = await bidRequester.requestV26(
  "https://example.com/v26",
  bidRequestV26
);
const bidResponseV30 = await bidRequester.requestV30(
  "https://example.com/v30",
  bidRequestV30
);
```

### 例外

```typescript
import {
  InvalidBidRequestException, // 400 Bad Request
  NoBidReasonException, // 204 No Content
  UnexpectedError, // other than 200, 204 400
} from "@nextad/bid-requester";

try {
  const bidResponse = await bidRequester.requestV26(
    "https://example.com/endpoint",
    bidRequest
  );
} catch (error) {
  if (error instanceof InvalidBidRequestException) {
    // エラーハンドリング...
  }
}
```

### モック

テストに便利なインターフェースを利用できます。

```typescript
import { IBidRequester } from "@nextad/bid-requester";

const bidRequesterMock = mock<IBidRequester>();
```

### オプション

OpenRTB が推奨しているデータエンコーディングやデータフォーマット以外に変更したい場合、オプションを使用できます。

用意されているオプション:

```typescript
export type BidRequesterOptions = {
  dataFormat?: string; // Content-Typeに該当 (デフォルト値は`application/json`)
  acceptEncoding?: string; // Accept-Encodingに該当 (デフォルト値は`gzip`)
  contentEncoding?: string; // Content-Encodingに該当 (デフォルト値は`gzip`)
  customHeaders?: Record<string, string>; // カスタムヘッダー (通常はトークンなどの認証に利用)
};
```

利用方法:

```typescript
import { BidRequester } from "@nextad/bid-requester";
import { BidRequest, BidResponse } from "iab-openrtb/v26";

const bidRequester = new BidRequester({
  acceptEncoding: "*",
  contentEncoding: "*",
});

const bidRequest: BidRequest = {
  id: "bid-request-1",
  imp: [
    {
      id: "1",
      banner: {
        w: 300,
        h: 250,
      },
    },
  ],
};

const bidResponse = await bidRequester.requestV26(
  "https://example.com/endpoint",
  bidRequest
);
```

## ライセンス

(MIT License)[./LICENSE]
