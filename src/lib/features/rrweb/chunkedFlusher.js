/**
 * Buffers rrweb events and uploads only the unflushed slice on each flush.
 * Previously flushed events are dropped from memory so stringify cost and
 * payload size stay proportional to the latest interval, not the whole session.
 */
export function createChunkedFlusher ({ upload, pathForChunk }) {
  const pending = []
  let seq = 0
  let chain = Promise.resolve()

  function push (event) {
    pending.push(event)
  }

  function flush () {
    chain = chain.then(run, run)
    return chain
  }

  async function run () {
    if (!pending.length) return
    const batch = pending.splice(0)
    try {
      await upload(pathForChunk(seq), JSON.stringify(batch))
      seq += 1
    } catch {
      pending.unshift(...batch)
    }
  }

  return {
    push,
    flush,
    get size () { return pending.length }
  }
}
