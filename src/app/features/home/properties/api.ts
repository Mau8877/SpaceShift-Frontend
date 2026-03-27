import { mockProperties } from "./datos";
import type { Property } from "./columns";

interface FetchPropertiesResponse {
  data: Array<Property>;
  totalRecords: number;
  pageCount: number;
}

interface FetchParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export const fetchProperties = async ({
  pageIndex,
  pageSize,
  search,
  status
}: FetchParams): Promise<FetchPropertiesResponse> => {
  
  // 1. Simular delay de red (1 segundo)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 2. Aplicar filtros lógicos (Simulando SQL WHERE)
  let filtered = [...mockProperties];

  if (search) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status && status !== "all") {
    filtered = filtered.filter((p) => p.status === status);
  }

  // 3. Calcular paginación (Simulando SQL OFFSET/LIMIT)
  const totalRecords = filtered.length;
  const pageCount = Math.ceil(totalRecords / pageSize);
  
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    totalRecords,
    pageCount,
  };
};