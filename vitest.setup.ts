import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// React 19's act() warns unless this is explicitly set in the test
// environment — needed for any test that wraps state updates (e.g. fake
// timer advances) in act() directly, like ResetTabButton's timeout test.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

afterEach(() => {
  cleanup()
})
