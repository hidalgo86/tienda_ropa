import PublicListWrapper from "./PublicListWrapper";
import Pagination from "./Pagination";
import Filtros from "../components/Filtros";
import Navbar from "../../components/Navbar";
import { notFound } from "next/navigation";
import { Product } from "@/types/product.type";
import FiltrosMobileButton from "./FiltrosMobileButton";

export default async function ProductsClient({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {

  return (<>hola</>
 
  );
}
