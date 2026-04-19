import {
  Genre,
  ProductAvailability,
  ProductState,
} from "@/types/domain/products";

export const toGraphqlAvailability = (
  availability?: ProductAvailability,
): "DISPONIBLE" | "AGOTADO" | undefined => {
  if (!availability) return undefined;

  if (availability === ProductAvailability.DISPONIBLE) {
    return "DISPONIBLE";
  }

  if (availability === ProductAvailability.AGOTADO) {
    return "AGOTADO";
  }

  return undefined;
};

export const toGraphqlState = (
  state?: ProductState,
): "ACTIVO" | "ELIMINADO" | undefined => {
  if (!state) return undefined;
  return state === ProductState.ACTIVO ? "ACTIVO" : "ELIMINADO";
};

export const toGraphqlGenre = (
  genre?: Genre,
): "NINA" | "NINO" | "UNISEX" | undefined => {
  if (!genre) return undefined;
  if (genre === Genre.NINA) return "NINA";
  if (genre === Genre.NINO) return "NINO";
  return "UNISEX";
};
