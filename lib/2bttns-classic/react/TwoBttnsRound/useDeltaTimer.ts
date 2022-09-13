import { useRef } from "react"

export type UseDeltaTimerConfig = {
  deltaDelay: number | "disabled"
}

function useDeltaTimer({ deltaDelay }: UseDeltaTimerConfig) {
  const deltaTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const delta = useRef<number | undefined>(0)

  const clearDeltaTimer = () => {
    if (deltaDelay === "disabled") {
      delta.current = undefined
      return
    }

    if (deltaTimer.current) {
      window.clearInterval(deltaTimer.current)
      delta.current = 0
    }
  }

  const initDeltaTimer = () => {
    if (deltaDelay === "disabled") {
      delta.current = undefined
      return
    }

    clearDeltaTimer()
    deltaTimer.current = setInterval(() => {
      delta.current += deltaDelay
    }, deltaDelay)
  }

  return { delta, initDeltaTimer, clearDeltaTimer }
}

export default useDeltaTimer
