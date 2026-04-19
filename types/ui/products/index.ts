import type { Product } from "@/types/domain/products";

type ProductActionHandler = (id: string) => void;

export interface ProductCardProps {
  product: Product;
  admin?: boolean;
  onEdit?: ProductActionHandler;
  onDelete?: ProductActionHandler;
  onRestore?: ProductActionHandler;
  onAddToCart?: ProductActionHandler;
  onFavorite?: ProductActionHandler;
}

export interface ProductCardPublicProps {
  product: Product;
  onAddToCart?: ProductActionHandler;
  onFavorite?: ProductActionHandler;
}

export interface ProductCardAdminProps {
  product: Product;
  onEdit?: ProductActionHandler;
  onDelete?: ProductActionHandler;
  onRestore?: ProductActionHandler;
  actionLoadingId?: string | null;
}

export interface ProductListPublicProps {
  products: Product[];
  onAddToCart?: ProductActionHandler;
  onFavorite?: ProductActionHandler;
}

export interface ProductListAdminProps {
  products: Product[];
  onEdit?: ProductActionHandler;
  onDelete?: ProductActionHandler;
  onRestore?: ProductActionHandler;
  actionLoadingId?: string | null;
}

export interface ProductDetailClientProps {
  producto: Product;
  mode?: "public" | "admin";
}

export interface SidebarItem {
  src: string;
  alt: string;
  label: string;
  href: string;
}

export interface SidebarDesktopProps {
  items: SidebarItem[];
  activeOption: string;
}

export interface SidebarMobileProps {
  items: SidebarItem[];
  activeOption: string;
}

export interface ProductFiltersProps {
  onFilterApply?: () => void;
}

export interface ProductFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface LegacyProductCardProps {
  producto: Product;
  priority?: boolean;
}

export interface ProductsPageProps {
  searchParams?: Promise<Record<string, string>>;
}

export interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export interface DashboardProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export * from "./forms";
