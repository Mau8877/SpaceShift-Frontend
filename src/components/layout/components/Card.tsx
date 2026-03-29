import * as React from "react"
// 1. Importas los componentes desde tu ruta de UI
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface Inmueble {
    id: string;
    titulo: string;
    descripcion: string;
    ubicacion: string;
    precio: number;
    estado: string;
    categoria: string;
}

export function ExampleCard({ data }: { data: Inmueble }) {
    return (
        // Usamos w-full para que se adapte a la grilla
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{data.titulo}</CardTitle>
                <CardDescription className="line-clamp-2">{data.descripcion}</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col space-y-2 text-sm">
                    <p><strong>Ubicación:</strong> {data.ubicacion}</p>
                    <p><strong>Precio:</strong> ${data.precio}</p>
                    <p><strong>Estado:</strong> {data.estado}</p>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between">
                <Button variant="outline">Detalles</Button>
                <Button>Contactar</Button>
            </CardFooter>
        </Card>
    )
}
