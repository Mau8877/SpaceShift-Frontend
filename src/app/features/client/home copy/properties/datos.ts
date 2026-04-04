import type { Property } from "./columns";

/**
 * Genera un set de 100 datos de prueba para la tabla de SpaceShift.
 * Permite probar la paginación truncada y el rendimiento de los filtros.
 */
export const generateMockProperties = (): Array<Property> => {
  const locations = [
    "Equipetrol",
    "Z. Sur",
    "Urbarí",
    "Las Palmas",
    "Plan 3000",
    "Barrio Lindo",
    "Norte - Av. Banzer",
    "Condominio La Riviera",
    "Av. Busch",
    "Santos Dumont",
  ];

  const names = [
    "Condominio",
    "Torre",
    "Residencia",
    "Smart Studio",
    "Quinta",
    "Edificio",
    "Loft Industrial",
    "Penthouse",
    "Dúplex Pro",
    "Cabaña Moderna",
  ];

  const statuses: Array<Property["status"]> = ["processed", "pending", "error"];
  const categories = ["venta", "alquiler", "anticretico", "alojamiento"];

  // Cambiamos el length a 100
  return Array.from({ length: 100 }).map((_, i) => {
    const namePrefix = names[i % names.length];
    // Generamos letras combinadas para nombres más variados (A, B... Z, AA, AB...)
    const letterCode = i % 26;
    const extraLetter = i > 25 ? String.fromCharCode(65 + Math.floor(i / 26) - 1) : "";
    const letter = extraLetter + String.fromCharCode(65 + letterCode);
    
    return {
      id: (i + 1).toString(),
      name: `${namePrefix} ${letter}-${i + 100}`,
      location: locations[i % locations.length],
      price: Math.floor(Math.random() * (950000 - 35000 + 1)) + 35000,
      status: statuses[i % statuses.length],
      category: categories[i % categories.length],
    };
  });
};

// Exportamos los 100 datos listos para la tabla
export const mockProperties = generateMockProperties();