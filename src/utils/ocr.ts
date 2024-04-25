import { createWorker } from 'tesseract.js'

// do ocr with worker
export async function recognize (lang: string, image: string | Buffer): Promise<string> {
  // create worker
  const worker = await createWorker(lang)

  // recognize the text from the image
  const result = await worker.recognize(image, { rotateAuto: true })

  // for single image, it should be safe to terminate the worker
  await worker.terminate()

  // return the recognized text
  return result.data.text
}