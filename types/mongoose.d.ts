import 'mongoose';

declare module 'mongoose' {
  interface Cursor<DocType = any, Options = never> extends NodeJS.ReadableStream {
    [Symbol.asyncIterator](): AsyncIterableIterator<DocType>;
  }
}
