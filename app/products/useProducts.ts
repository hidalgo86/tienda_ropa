import { gql, useQuery } from "@apollo/client";
import { Product } from "@/app/types/products";

const GET_PRODUCTS = gql`
  query Products($filters: ProductFilterInput, $pagination: PaginationInput) {
    products(filters: $filters, pagination: $pagination) {
      items {
        id
        name
        description
        genre
        size
        price
        stock
        imageUrl
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export default function useProducts({
  filters = {},
  pagination = { page: 1, limit: 20 },
}: {
  filters?: any;
  pagination?: { page: number; limit: number };
} = {}) {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { filters, pagination },
  });

  return {
    products: data?.products.items as Product[] | undefined,
    totalItems: data?.products.totalItems,
    totalPages: data?.products.totalPages,
    currentPage: data?.products.currentPage,
    loading,
    error,
  };
}
