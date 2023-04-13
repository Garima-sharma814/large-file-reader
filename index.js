import fs from 'fs';

function readBytes(fd, sharedBuffer) {
  return new Promise((resolve, reject) => {
    fs.read(fd, sharedBuffer, 0, sharedBuffer.length, null, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

async function* generateChunks(filePath, size) {
  const sharedBuffer = Buffer.alloc(size);
  const stats = fs.statSync(filePath); // file details
  const fd = fs.openSync(filePath); // file descriptor
  let bytesRead = 0; // how many bytes were read
  let end = size;

  for (let i = 0; i < Math.ceil(stats.size / size); i++) {
    await readBytes(fd, sharedBuffer);
    bytesRead = (i + 1) * size;
    if (bytesRead > stats.size) {
      // When we reach the end of file,
      // we have to calculate how many bytes were actually read
      end = size - (bytesRead - stats.size);
    }
    yield sharedBuffer.slice(0, end);
  }
}

const CHUNK_SIZE = 10000000; // 10MB
let count = 0;
let fileCount = 0;

async function main() {
  for await (const chunk of generateChunks('./extra/read.json', CHUNK_SIZE)) {
    // do someting with data
    console.log(chunk);
    console.log('------------------------------------------------------');
    // fs.writeFileSync(`./extra/read${+new Date()}.json`, chunk);

    fs.appendFileSync(`./extra/read${fileCount}.json`, chunk);

    if (count++ == 10) {
      count = 0;
      fileCount++;
    }
  }
}

main();
