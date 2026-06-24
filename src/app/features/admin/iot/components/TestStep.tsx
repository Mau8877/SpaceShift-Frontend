import { useEffect, useRef } from "react"
import { CancelCircleIcon, CheckmarkCircle02Icon, Loading01Icon } from "hugeicons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import { useTestPlugMutation } from "../store"
import type { WizardAction, WizardState } from "./usePlugScanWizard"

type TestStepProps = {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  onFinish: () => void
}

export const TestStep = ({ state, dispatch, onFinish }: TestStepProps) => {
  const [testPlug, { isLoading }] = useTestPlugMutation()
  const triggeredRef = useRef(false)

  const runTest = async () => {
    if (!state.registeredPlugId) {
      return
    }
    const result = await testPlug(state.registeredPlugId).unwrap()
    dispatch({ type: "SET_TEST_RESULT", result })
  }

  useEffect(() => {
    if (state.step === "testing" && !triggeredRef.current) {
      triggeredRef.current = true
      runTest()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step])

  if (state.step === "testing" || isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <Loading01Icon className="animate-spin text-muted-foreground" size={32} />
        <p className="text-center text-sm text-muted-foreground">
          Probando conexión... encendiendo y apagando el enchufe.
          <br />
          Asegúrate de que nada esté conectado al enchufe durante el test.
        </p>
      </div>
    )
  }

  if (!state.testResult) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {state.testResult.testPassed ? (
        <Alert className="border-emerald-500">
          <CheckmarkCircle02Icon className="text-emerald-500" />
          <AlertTitle>Test exitoso</AlertTitle>
          <AlertDescription>{state.testResult.message}</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <CancelCircleIcon />
          <AlertTitle>El enchufe no respondió</AlertTitle>
          <AlertDescription>{state.testResult.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        {!state.testResult.testPassed ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              triggeredRef.current = false
              dispatch({ type: "REGISTERED", plugId: state.registeredPlugId! })
            }}
          >
            Reintentar test
          </Button>
        ) : null}
        <Button type="button" onClick={onFinish}>
          Finalizar
        </Button>
      </div>
    </div>
  )
}
