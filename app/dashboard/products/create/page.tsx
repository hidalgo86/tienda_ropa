// se debe crear un componente de cliente para crear productos
// ya que utiliza estados y efectos de React
// además de manejar formularios
// Importante: No mover este archivo a /components
// ya que Next.js no permite componentes de cliente en /app/api
// Usar Tailwind CSS para estilos modernos y accesibles
// Incluir comentarios en el código para mayor claridad
// Asegurarse de que el componente sea compatible con TypeScript
// y que funcione correctamente con diferentes tipos de datos de productos
// Exportar el componente para su uso en otras partes del dashboard
// Incluir manejo de estados de carga o error si es necesario
// Asegurarse de que el componente sea probado y funcione correctamente
// con diferentes tipos de datos de productos
// y en diferentes tamaños de pantalla
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Product,
  UploadProduct,
  VariantProduct,
  Size,
  Genre,
} from "@/types/product.type";

const CreateProductPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UploadProduct>>({
    name: "",
    genre: undefined,
    description: "",
    variants: [] as VariantProduct[],
  });
  // Estado para la imagen y su previsualización
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Estado para variantes temporales
  const [variant, setVariant] = useState<VariantProduct>({
    size: undefined as any, // Ajuste para evitar error de tipo, asumiendo que se selecciona luego
    stock: 0,
    price: 0,
  });
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  // Manejar cambios en los campos de variante
  const handleVariantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVariant((prev) => ({
      ...prev,
      [name]: name === "size" ? (value as Size) : Number(value),
    }));
  };

  // Agregar variante a la lista
  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variant.size || variant.stock < 0 || variant.price < 0) return;
    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { ...variant }],
    }));
    setVariant({ size: undefined as any, stock: 0, price: 0 });
  };

  // Eliminar variante
  const handleRemoveVariant = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== idx),
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Validación: al menos una variante
      if (!form.variants || form.variants.length === 0) {
        throw new Error("Agrega al menos una variante (talla, stock y precio)");
      }
      const res = await fetch(`/api/products/create`, {
        method: "POST",
        body: createFormData(),
      });
      if (!res.ok) {
        let msg = "Error al crear producto";
        try {
          const data = await res.json();
          msg =
            typeof data?.error === "string"
              ? data.error
              : JSON.stringify(data?.error ?? data);
        } catch {}
        throw new Error(msg);
      }
      router.push("/dashboard/products");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el producto"
      );
    }
    setLoading(false);
  };
  const createFormData = () => {
    const formData = new FormData();
    // Agregar campos del formulario
    for (const key in form) {
      if (key === "variants") {
        formData.append("variants", JSON.stringify(form.variants || []));
      } else {
        const value = form[key as keyof UploadProduct];
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      }
    }
    // Agregar imagen
    if (image) {
      formData.append("image", image);
    }
    return formData;
  };

  // Limpiar URL de previsualización para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Crear nuevo producto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Previsualización de imagen o esqueleto */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-40 h-40 bg-gray-100 border border-gray-300 rounded flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Previsualización"
                className="object-cover w-full h-full"
              />
            ) : (
              <svg
                className="w-16 h-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <input
          type="text"
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          placeholder="Nombre del producto"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Descripción del producto"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <select
          name="genre"
          value={form.genre || ""}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        >
          <option value="" disabled>
            Selecciona un género
          </option>
          <option value={Genre.NINO}>Niño</option>
          <option value={Genre.NINA}>Niña</option>
          <option value={Genre.UNISEX}>Unisex</option>
        </select>

        {/* Variantes (tallas, stock, precio) */}
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Variantes</h2>
          <div className="flex gap-2 mb-2">
            <select
              name="size"
              value={variant.size}
              onChange={handleVariantChange}
              className="p-2 border border-gray-300 rounded w-1/3"
            >
              <option value="" disabled>
                Selecciona talla
              </option>
              {Object.values(Size).map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="stock"
              value={variant.stock}
              onChange={handleVariantChange}
              placeholder="Stock"
              min={0}
              className="p-2 border border-gray-300 rounded w-1/3"
            />
            <input
              type="number"
              name="price"
              value={variant.price}
              onChange={handleVariantChange}
              placeholder="Precio"
              min={0}
              step={0.01}
              className="p-2 border border-gray-300 rounded w-1/3"
            />
            <button
              onClick={handleAddVariant}
              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              type="button"
            >
              Agregar
            </button>
          </div>
          {/* Lista de variantes agregadas */}
          <ul className="space-y-1">
            {(form.variants || []).map((v, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <span className="font-mono">
                  Talla: {v.size}, Stock: {v.stock}, Precio: ${v.price}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear Producto"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default CreateProductPage;
