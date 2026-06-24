import { useReducer } from "react"
import type { PlugTestResult, TuyaDeviceScanResult } from "../types"

export type WizardStep =
  | "scanning"
  | "selecting"
  | "naming"
  | "registering"
  | "testing"
  | "done"

export interface WizardState {
  step: WizardStep
  selectedDevice: TuyaDeviceScanResult | null
  alias: string
  notes: string
  registeredPlugId: string | null
  testResult: PlugTestResult | null
}

export type WizardAction =
  | { type: "GO_TO_SELECTING" }
  | { type: "SELECT_DEVICE"; device: TuyaDeviceScanResult }
  | { type: "SET_ALIAS"; alias: string }
  | { type: "SET_NOTES"; notes: string }
  | { type: "START_REGISTERING" }
  | { type: "REGISTERED"; plugId: string }
  | { type: "SET_TEST_RESULT"; result: PlugTestResult }
  | { type: "RESET" }

const initialState: WizardState = {
  step: "scanning",
  selectedDevice: null,
  alias: "",
  notes: "",
  registeredPlugId: null,
  testResult: null,
}

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "GO_TO_SELECTING":
      return { ...state, step: "selecting" }
    case "SELECT_DEVICE":
      return { ...state, step: "naming", selectedDevice: action.device }
    case "SET_ALIAS":
      return { ...state, alias: action.alias }
    case "SET_NOTES":
      return { ...state, notes: action.notes }
    case "START_REGISTERING":
      return { ...state, step: "registering" }
    case "REGISTERED":
      return { ...state, step: "testing", registeredPlugId: action.plugId }
    case "SET_TEST_RESULT":
      return { ...state, step: "done", testResult: action.result }
    case "RESET":
      return initialState
    default:
      return state
  }
}

export function usePlugScanWizard() {
  const [state, dispatch] = useReducer(reducer, initialState)
  return { state, dispatch }
}
