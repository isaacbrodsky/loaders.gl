
const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB—biggest value that keeps UI responsive

async function* makeFileReaderIterator(file, options = {}) {
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;

  let offset = 0;
  while (offset < file.size) {
    const end = offset + chunkSize;
    const p = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = function loaded(event) {
        resolve(event.target.result);
        // TODO: handle error
      }
      const slice = file.slice(offset, end);
      fileReader.readAsArrayBuffer(slice);
    });
    const chunk = await p;
    offset = end;
    yield chunk;
  }
}
