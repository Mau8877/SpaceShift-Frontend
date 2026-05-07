import type { DashboardProperty } from "../types"

export const misInmueblesMock: DashboardProperty[] = [
  {
    id: "pub-1",
    titulo: "Departamento moderno en Equipetrol",
    descripcionGeneral:
      "Departamento amplio, bien ubicado y cercano a centros comerciales.",
    tipoTransaccion: "ALQUILER",
    precio: 3500,
    moneda: "Bs.",
    estadoPublicacion: "ACTIVO",
    fechaPublicacion: "2026-05-01",
    estadoOperativo: "DISPONIBLE",
    inmueble: {
      id: "inm-1",
      tipoInmueble: "Departamento",
      areaTerreno: 0,
      areaConstruida: 85,
      habitaciones: 2,
      banos: 2,
      garajes: 1,
      antiguedadAnios: 4,
      ubicacion: {
        ciudad: "Santa Cruz",
        zonaBarrios: "Equipetrol",
        direccionExacta: "Av. San Martín",
      },
    },
    imagenes: [
      {
        id: "img-1",
        urlImage:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "pub-2",
    titulo: "Casa familiar zona Norte",
    descripcionGeneral:
      "Casa espaciosa ideal para familia, con patio y garaje amplio.",
    tipoTransaccion: "VENTA",
    precio: 980000,
    moneda: "Bs.",
    estadoPublicacion: "ACTIVO",
    fechaPublicacion: "2026-04-25",
    estadoOperativo: "OCUPADO",
    inmueble: {
      id: "inm-2",
      tipoInmueble: "Casa",
      areaTerreno: 320,
      areaConstruida: 210,
      habitaciones: 4,
      banos: 3,
      garajes: 2,
      antiguedadAnios: 7,
      ubicacion: {
        ciudad: "Santa Cruz",
        zonaBarrios: "Norte - Av. Banzer",
        direccionExacta: "Entre 5to y 6to anillo",
      },
    },
    imagenes: [
      {
        id: "img-2",
        urlImage:
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "pub-3",
    titulo: "Monoambiente céntrico para Airbnb",
    descripcionGeneral:
      "Monoambiente amoblado, ideal para estadías cortas y ejecutivos.",
    tipoTransaccion: "AIRBNB",
    precio: 180,
    moneda: "Bs.",
    estadoPublicacion: "ACTIVO",
    fechaPublicacion: "2026-04-20",
    estadoOperativo: "DISPONIBLE",
    inmueble: {
      id: "inm-3",
      tipoInmueble: "Monoambiente",
      areaTerreno: 0,
      areaConstruida: 38,
      habitaciones: 1,
      banos: 1,
      garajes: 0,
      antiguedadAnios: 2,
      ubicacion: {
        ciudad: "Santa Cruz",
        zonaBarrios: "Centro",
        direccionExacta: "Cerca de la plaza principal",
      },
    },
    imagenes: [
      {
        id: "img-3",
        urlImage:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "pub-4",
    titulo: "Terreno en zona de crecimiento",
    descripcionGeneral:
      "Terreno amplio con buena proyección comercial y acceso pavimentado.",
    tipoTransaccion: "VENTA",
    precio: 420000,
    moneda: "Bs.",
    estadoPublicacion: "INACTIVO",
    fechaPublicacion: "2026-03-15",
    estadoOperativo: "INACTIVO",
    inmueble: {
      id: "inm-4",
      tipoInmueble: "Terreno",
      areaTerreno: 500,
      areaConstruida: 0,
      habitaciones: 0,
      banos: 0,
      garajes: 0,
      antiguedadAnios: 0,
      ubicacion: {
        ciudad: "Santa Cruz",
        zonaBarrios: "Urubó",
        direccionExacta: "Zona residencial en expansión",
      },
    },
    imagenes: [
      {
        id: "img-4",
        urlImage:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
]
