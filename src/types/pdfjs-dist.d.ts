declare module 'pdfjs-dist/legacy/build/pdf' {
  export const GlobalWorkerOptions: {
    workerSrc: string
  }

  export function getDocument(src: string | URL | Uint8Array | ArrayBuffer): {
    promise: Promise<{ numPages: number }>
  }
}
