import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

// perform a scan and return a generator that yields each page of Items
export async function* fullScanSeq<I extends DocumentClient.AttributeMap>(
  docClient: DocumentClient,
  params: DocumentClient.ScanInput
) {
  while (true) {
    const data = await docClient.scan(params).promise();

    if (data.Items && data.Items.length) {
      const items = data.Items as I[];
      yield* items;
    }

    if (data.LastEvaluatedKey === undefined) {
      break;
    }

    params = { ...params, ExclusiveStartKey: data.LastEvaluatedKey };
  }
}

// allow full scan in one promise function
export async function fullScanProm<I extends DocumentClient.AttributeMap>(
  docClient: DocumentClient,
  params: DocumentClient.ScanInput,
  maxDepth = -1,
  sleepWait = 0
) {
  const items: I[] = [];

  if (!maxDepth) {
    return items;
  }

  while (true) {
    if (maxDepth > 0) {
      maxDepth--;
    }
    const data = await docClient.scan(params).promise();
    items.push.apply(items, data.Items as I[]);

    if (maxDepth === 0 || data.LastEvaluatedKey === undefined) {
      // console.log(`done ${items.length}.`);
      break;
    }

    // console.log(`scanning for more... ${data.LastEvaluatedKey}`);
    params = { ...params, ExclusiveStartKey: data.LastEvaluatedKey };

    if (sleepWait) {
      await sleep(sleepWait);
    }
  }

  return items;
}

// Helpers

async function sleep(delayMs: number): Promise<undefined> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), delayMs);
  });
}
