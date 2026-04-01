import { readFileSync } from 'fs';
import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Parse .env.local manually
const envContent = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let val = trimmed.slice(eqIdx + 1);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[key] = val;
}

const bucket = env.R2_BUCKET_NAME;
const client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

// Mapping: [srcPrefix, dstPrefix, flatten]
const mappings = [
  ['game01/main-screen/', 'game01/assets/main/main-screen/', false],
  ['game01/main-ui/', 'game01/assets/main/main-ui/', false],
  ['game01/character/', 'game01/assets/game/character/', false],
  ['game01/map/', 'game01/assets/game/map/', false],
  ['game01/background/', 'game01/assets/game/background/', false],
  ['game01/ui/', 'game01/assets/game/ui/', false],
  ['game01/etc-image/', 'game01/assets/etc/etc-image/', false],
  ['game01/audio/', 'game01/assets/etc/audio/', false],
  ['game01/content/', 'game01/assets/etc/content/', false],
  ['launch/game01/icon/', 'game01/assets/launch/', true],
  ['launch/game01/feature/', 'game01/assets/launch/', true],
  ['launch/game01/screenshots/', 'game01/assets/launch/', true],
  ['layout-editor/drafts/game01/', 'game01/layout/drafts/', false],
];

// Special case: exact key rename
const exactRenames = [
  ['layout-editor/game01-index', 'game01/layout/index'],
];

async function listAllKeys(prefix) {
  const keys = [];
  let continuationToken;
  do {
    const res = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    if (res.Contents) {
      for (const obj of res.Contents) {
        keys.push(obj.Key);
      }
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
  return keys;
}

async function copyAndDelete(srcKey, dstKey) {
  const copySource = encodeURIComponent(`${bucket}/${srcKey}`);
  await client.send(new CopyObjectCommand({
    Bucket: bucket,
    Key: dstKey,
    CopySource: copySource,
  }));
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: srcKey,
  }));
  console.log(`MOVED: ${srcKey} → ${dstKey}`);
}

async function main() {
  let totalMoved = 0;

  // Process prefix mappings
  for (const [srcPrefix, dstPrefix, flatten] of mappings) {
    const keys = await listAllKeys(srcPrefix);
    if (keys.length === 0) {
      console.log(`SKIP: No files under ${srcPrefix}`);
      continue;
    }
    console.log(`\nProcessing ${srcPrefix} (${keys.length} files)`);
    for (const key of keys) {
      const relative = key.slice(srcPrefix.length);
      let newKey;
      if (flatten) {
        // Only keep the filename (last segment)
        const filename = relative.split('/').pop();
        newKey = dstPrefix + filename;
      } else {
        newKey = dstPrefix + relative;
      }
      await copyAndDelete(key, newKey);
      totalMoved++;
    }
  }

  // Process exact renames
  for (const [srcKey, dstKey] of exactRenames) {
    // Check if it exists by listing
    const keys = await listAllKeys(srcKey);
    const exactMatch = keys.find(k => k === srcKey);
    if (!exactMatch) {
      console.log(`SKIP: ${srcKey} not found`);
      continue;
    }
    await copyAndDelete(srcKey, dstKey);
    totalMoved++;
  }

  console.log(`\nDone! Total moved: ${totalMoved}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
