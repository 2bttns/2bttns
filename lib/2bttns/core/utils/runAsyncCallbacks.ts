export type AsyncCallback = () => Promise<void>

export default async function runAsyncCallbackBatches(
  batches: AsyncCallback[][]
) {
  for await (const batch of batches) {
    await Promise.all(batch.map((cb) => cb()))
  }
}
