"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductClient, ProductServer } from "@/types/product.type";

// ------------------ Tipos ------------------
type Mode = "create" | "edit";

interface FormProductProps {
  mode?: Mode;
  product?: ProductServer | null;
}

// ------------------ Valores por defecto ------------------
const DEFAULT_FORM: ProductClient = {
  id: "",
  name: "",
  genre: "unisex",
  description: "",
  size: "",
  price: 0,
  stock: 1,
  imageUrl: "",
  imagePublicId: "",
};

// ------------------ Input reutilizable ------------------
interface InputProps {
  label: string;
  name: keyof ProductClient;
  value: string | number;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

const InputField = ({
  label,
  name,
  value,
  type = "text",
  onChange,
  required,
  disabled = false,
}: InputProps) => (
  <div className="mb-3">
    <label className="block mb-1">{label}</label>
    {type === "textarea" ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1 disabled:opacity-50"
        required={required}
        disabled={disabled}
      />
    ) : (
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1 disabled:opacity-50"
        required={required}
        disabled={disabled}
      />
    )}
  </div>
);

// ------------------ Select reutilizable ------------------
interface SelectProps {
  label: string;
  value: string | number;
  options: (string | number)[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

const SelectField = ({ label, value, options, onChange, required, disabled = false }: SelectProps) => (
  <div className="mb-3">
    <label className="block mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full border rounded px-2 py-1 disabled:opacity-50"
      required={required}
      disabled={disabled}
    >
      <option value="">Selecciona {label.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// ------------------ Helper ------------------
const toServerProduct = (form: ProductClient): ProductServer => ({
  ...form,
  genre: (form.genre || "unisex").toUpperCase() as "NINA" | "NINO" | "UNISEX",
  price: Number(form.price),
  stock: Number(form.stock),
  size: form.size.split(",").map((s) => s.trim()),
});

// ------------------ Helper: construir FormData ------------------
const buildFormData = (payload: ProductServer, file: File | null) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "size") formData.append(key, JSON.stringify(value));
    else formData.append(key, String(value ?? ""));
  });
  if (file) formData.append("file", file);
  return formData;
};

// ------------------ Componente principal ------------------
export default function FormProducto({ mode = "create", product }: FormProductProps) {
  const router = useRouter();

  const [form, setForm] = useState<ProductClient>({ ...DEFAULT_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genres = ["niña", "niño", "unisex"];
  const stockOptions = Array.from({ length: 101 }, (_, i) => i);

  // Inicializar form si recibimos producto (modo editar)
  useEffect(() => {
    if (!product) {
      setForm({ ...DEFAULT_FORM });
      setPreview(null);
      return;
    }

    setForm({
      id: product.id ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      genre: product.genre?.toLowerCase() ?? "unisex",
      size: product.size.join(","),
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl ?? "",
      imagePublicId: product.imagePublicId ?? "",
    });
    setPreview(product.imageUrl ?? null);
  }, [product]);

  // Preview de imagen
  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setPreview(result);
        setForm((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);

    return () => reader.abort?.();
  }, [file]);

  // ------------------ Handlers ------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validaciones
      if (!form.name.trim()) throw new Error("El nombre es obligatorio");
      if (isNaN(Number(form.price))) throw new Error("Precio inválido");
      if (isNaN(Number(form.stock))) throw new Error("Stock inválido");

      const payload = toServerProduct(form);
      const formData = buildFormData(payload, file);

      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const url = mode === "edit" && payload.id ? `${base}/products/${payload.id}` : `${base}/products`;
      const method = mode === "edit" && payload.id ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      if (!res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || json.error || text);
        } catch {
          throw new Error(text || "Error al comunicarse con el servidor");
        }
      }

      router.push("/dashboard?opcion=Productos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Render ------------------
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-2">
        {mode === "edit" ? "Editar producto" : "Agregar nuevo producto"}
      </h2>
      <hr className="mb-5 border-gray-300" />

      {/* Imagen */}
      <div className="mb-3">
        {preview && (
          <div className="mb-3 flex justify-center">
            <div
              className="border-2 border-gray-300 bg-gray-50 rounded-lg p-2 shadow-inner flex items-center justify-center"
              style={{ minWidth: 120, minHeight: 120 }}
            >
              <img
                src={preview}
                alt="Vista previa"
                className="max-h-40 rounded object-contain"
                style={{ maxWidth: 160, maxHeight: 160 }}
              />
            </div>
          </div>
        )}

        <label className="block mb-1">Imagen (subir archivo)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border rounded px-2 py-1 mb-2 disabled:opacity-50"
          disabled={loading}
        />
      </div>

      <InputField label="Nombre" name="name" value={form.name} onChange={handleChange} required disabled={loading} />
      <InputField label="Descripción" name="description" value={form.description} onChange={handleChange} type="textarea" required disabled={loading} />
      <SelectField label="Categoría" value={form.genre} options={genres} onChange={(e) => setForm((prev) => ({ ...prev, genre: e.target.value }))} required disabled={loading} />
      <InputField label="Talla (ej: S,M,L)" name="size" value={form.size} onChange={handleChange} required disabled={loading} />
      <InputField label="Precio" name="price" type="number" value={form.price} onChange={handleChange} required disabled={loading} />
      <SelectField label="Stock" value={form.stock} options={stockOptions} onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))} required disabled={loading} />

      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="flex gap-4 mt-4">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Guardando..." : "Aceptar"}
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => router.push("/dashboard?option=products")}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
