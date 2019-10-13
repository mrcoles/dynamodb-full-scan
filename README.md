# DynamoDB Async Scan

_Helper functions for doing full paginated scan operations as a Promise or AsyncGenerator with the "asw-sdk" DynamoDB DocumentClient._

The DynamoDB DocumentClient class in the "aws-sdk" node package exposes Promise interfaces for its various operations via the additional `.promise()` method, e.g.,

```
docClient.put(params).promise();
```

You can use this Promise API with the scan operation, but if you want to do a full scan of the database, then it requires a little extra work.

This library exposes two helper functions to let you get the results of a full paginated scan operation as a single Promise or lazily evaluated as an AsyncGenerator, returning the combined `Items` of each paginated call.

_Say goodbye to that old-fashioned and clunky `onScan` pattern and embrace async generators!_

## fullScanProm - single promise of all items for a full scan

Return a Promise of all the Items from a scan in a single array. Set `maxDepth` to limit how many times it pages and/or `sleepWait` to add a delay between pagination calls (in milliseconds). You can also cast the results via the generic.

### Signature

```typescript
function fullScanProm<I extends DocumentClient.AttributeMap>(
  docClient: DocumentClient,
  params: DocumentClient.ScanInput,
  maxDepth = -1,
  sleepWait = 0
): Promise<I[]>;
```

### Example

```typescript
type Item = { id: string; name: string; description?: string };
const items = await fullScan<Item>(docClient, {
  TableName: "items",
  FilterExpression: "attribute_not_exists(#d)",
  ExpressionAttributeNames: { "#d": "description" }
});

for (let item of items) {
  console.log(`item: id=${item.id}, name=${item.name}`);
}
```

## scanSeq - async generator for all items from a full scan

Return an async generator that yields items from a full scan operation (albeit the scans are performed in a lazy manner, only being requested if you iterate up to the next page of items).

### Signature

```typescript
function* fullScanSeq<I extends DocumentClient.AttributeMap>(
  docClient: DocumentClient,
  params: DocumentClient.ScanInput
): AsyncGenerator<I, void, undefined>;
```

### Example

```typescript
type Item = { id: string; name: string; description?: string };
const itemSeq = await fullScan<Item>(docClient, {
  TableName: "items",
  FilterExpression: "attribute_not_exists(#d)",
  ExpressionAttributeNames: { "#d": "description" }
});

for async (let item of items) {
  console.log(`item: id=${item.id}, name=${item.name}`);
}
```
