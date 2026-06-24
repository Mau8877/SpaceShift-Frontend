import * as React from "react"
import { useContractPaymentAndSignature } from "../../hooks/useContractPaymentAndSignature"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  SignatureIcon,
  Upload01Icon,
  CreditCardIcon,
  CheckmarkCircle02Icon,
} from "hugeicons-react"

interface ContractPaymentAndSignatureProps {
  contratoCreado: any
  moneda: string
}

export function ContractPaymentAndSignature({
  contratoCreado,
  moneda,
}: ContractPaymentAndSignatureProps) {
  const {
    pagos,
    isSubiendo,
    isGenerandoStripe,
    isFirmando,
    hasCompletedPayment,
    fileInputRef,
    handleFileChange,
    handleStripePayment,
    handleSignContract,
  } = useContractPaymentAndSignature({ contratoCreado })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-2xl py-6 md:py-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
          <SignatureIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Pago y Firma de Contrato
          </h1>
          <p className="text-sm text-muted-foreground">
            Completa el pago inicial y firma el contrato para activarlo.
          </p>
        </div>
      </div>

      <Card className="border border-border/50 bg-background shadow-md p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-border/50 pb-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">Código Contrato</p>
            <p className="text-base font-bold font-mono">{contratoCreado.codigo}</p>
          </div>
          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 uppercase text-xs">
            {contratoCreado.tipoContrato}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Inmueble</p>
            <p className="font-semibold text-foreground truncate">{contratoCreado.inmuebleTitulo}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Monto Acordado</p>
            <p className="font-bold text-foreground">
              {contratoCreado.moneda} {contratoCreado.montoAcordado?.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="border border-border/50 bg-background shadow-md p-5 space-y-4">
        <h3 className="text-base font-bold text-foreground">1. Pago Inicial Programado</h3>

        <div className="space-y-3">
          {pagos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Generando cuotas de pago...</p>
          ) : (
            pagos.map((pago: any) => {
              const isCompletado = pago.estadoPago === "COMPLETADO"
              const isEnRevision = pago.estadoPago === "EN_REVISION"

              return (
                <div
                  key={pago.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-muted/20"
                >
                  <div>
                    <p className="text-sm font-bold capitalize">
                      {pago.tipoPago.replace("_", " ").toLowerCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Monto: <span className="font-semibold text-foreground">{moneda} {pago.monto}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vence el: {pago.fechaVencimiento}
                    </p>
                  </div>

                  {isCompletado ? (
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 uppercase text-xs gap-1 py-1 font-semibold rounded-full">
                      <CheckmarkCircle02Icon className="h-3.5 w-3.5 text-emerald-500" />
                      Pagado
                    </Badge>
                  ) : isEnRevision ? (
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 uppercase text-xs py-1 font-semibold rounded-full">
                      En Revisión
                    </Badge>
                  ) : (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 h-10 font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl"
                        onClick={() => handleStripePayment(pago.id)}
                        disabled={isGenerandoStripe}
                      >
                        <CreditCardIcon className="h-4 w-4" />
                        Pagar Tarjeta
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 h-10 font-semibold rounded-xl"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubiendo}
                      >
                        <Upload01Icon className="h-4 w-4" />
                        Subir Comprobante
                      </Button>

                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e, pago.id)}
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Card>

      <Card className="border border-border/50 bg-background shadow-md p-5 space-y-4">
        <h3 className="text-base font-bold text-foreground">2. Firmar Contrato</h3>

        {!hasCompletedPayment ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 font-medium">
            ⚠️ Debes completar el pago inicial programado arriba para habilitar la firma digital de este contrato.
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-800 font-medium">
            ✓ ¡Pago completado! Ya puedes proceder a firmar el contrato.
          </div>
        )}

        <Button
          className="w-full h-12 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
          disabled={!hasCompletedPayment || isFirmando}
          onClick={handleSignContract}
        >
          <SignatureIcon className="h-5 w-5" />
          {isFirmando ? "Firmando contrato..." : "Firmar Contrato Digitalmente"}
        </Button>
      </Card>
    </motion.div>
  )
}

