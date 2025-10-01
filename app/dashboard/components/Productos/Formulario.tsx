"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ------------------ Tipos ------------------
export interface Producto {
  id?: string;
  name: string;
  description: string;
  genre: string;
  size: string; // en el formulario lo tratamos como CSV ("S,M,L")
  price: string; // controlado como string en el input
  stock: string; // controlado como string en el input
  imageUrl: string; // puede ser dataURL (preview) o URL remota
  imagePublicId?: string | null;
}

interface CreateProductInput {
  name: string;
  description?: string;
  genre?: string;
  size?: string[];
  price: number;
  stock: number;
  imageUrl?: string;
  imagePublicId?: string;
}

type FormProductoModo = "crear" | "editar";

interface FormProductoProps {
  producto?: Producto | null;
  modo?: FormProductoModo;
}

// ------------------ Valores por defecto ------------------
const DEFAULT_FORM: Producto = {
  name: "",
  genre: "",
  description: "",
  size: "",
  price: "",
  stock: "",
  imageUrl: "",
  imagePublicId: "",
};

// ------------------ Input reutilizable ------------------
interface InputProps {
  label: string;
  name: keyof Producto;
  value: string;
  type?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  required?: boolean;
}

const InputField = ({
  label,
  name,
  value,
  type = "text",
  onChange,
  required,
}: InputProps) => (
  <div className="mb-3">
    <label className="block mb-1">{label}</label>
    {type === "textarea" ? (
      <textarea
        name={String(name)}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1"
        required={required}
      />
    ) : (
      <input
        name={String(name)}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1"
        required={required}
      />
    )}
  </div>
);

// ------------------ Componente principal ------------------
export default function FormProducto({ modo = "crear", producto = null }: FormProductoProps) {
  const router = useRouter();

  // Inicialmente usamos valores por defecto para evitar leer propiedades de `producto` cuando es null
  const [form, setForm] = useState<Producto>({ ...DEFAULT_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genres = ["niña", "niño", "unisex"];
  const stockOptions = Array.from({ length: 101 }, (_, i) => i);

  // Si el prop `producto` cambia (p. ej. en edición), actualizamos el formulario y el preview.
  useEffect(() => {
    if (producto) {
      // mezclamos con DEFAULT_FORM para asegurarnos de que las propiedades faltantes existen
      setForm({ ...DEFAULT_FORM, ...producto });
      setPreview(producto.imageUrl ?? null);
    } else {
      // si no hay producto, dejamos valores por defecto
      setForm({ ...DEFAULT_FORM });
      setPreview(null);
    }
  }, [producto]);

  useEffect(() => {
    // Generar preview cuando se seleccione file
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setPreview(result);
        // Actualizamos solo el campo imageUrl del formulario
        setForm((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);

    // Cleanup: abort() está disponible en FileReader, pero usamos optional chaining para mayor seguridad
    return () => reader.abort?.();
  }, [file]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.currentTarget.name as keyof Producto;
    const value = e.currentTarget.value;
    setForm((prev) => ({ ...prev, [name]: value } as Producto));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validación mínima en cliente
      if (!form.name || form.name.trim().length === 0) throw new Error("El nombre es obligatorio");
      if (!form.price || Number.isNaN(Number(form.price))) throw new Error("Precio inválido");
      if (!form.stock || Number.isNaN(Number(form.stock))) throw new Error("Stock inválido");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description ?? "");
      formData.append("genre", form.genre ?? "");
      formData.append("size", form.size ?? ""); // backend deberá parsear el CSV o recibir múltiples
      formData.append("price", String(form.price));
      formData.append("stock", String(form.stock));

      if (file) {
        formData.append("file", file);
      }

      // Construir URL base desde env
      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

      // Para actualizar, usamos el id que está en el formulario (si existe). Así no dependemos del prop `producto`.
      const url = modo === "editar" && form.id ? `${base}/products/${form.id}` : `${base}/products`;
      const method = modo === "editar" && form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
        // NO poner headers Content-Type: el navegador lo gestiona con boundary
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || json.error || text || "Error desconocido");
        } catch {
          throw new Error(text || "Error al comunicarse con el servidor");
        }
      }

      // Éxito: redirigir
      router.push("/dashboard?opcion=Productos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-2">{modo === "editar" ? "Editar producto" : "Agregar nuevo producto"}</h2>
      <hr className="mb-5 border-gray-300" />

      {/* Imagen */}
      <div className="mb-3">
        {preview && (
          <div className="mb-3 flex justify-center">
            <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-2 shadow-inner flex items-center justify-center" style={{ minWidth: 120, minHeight: 120 }}>
              <img src={preview} alt="Vista previa" className="max-h-40 rounded object-contain" style={{ maxWidth: 160, maxHeight: 160 }} />
            </div>
          </div>
        )}

        <label className="block mb-1">Imagen (subir archivo)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border rounded px-2 py-1 mb-2"
          disabled={loading}
        />
      </div>

      <InputField label="Nombre" name="name" value={form.name} onChange={handleChange} required />
      <InputField label="Descripción" name="description" value={form.description} onChange={handleChange} type="textarea" required />

      <div className="mb-3">
        <label className="block mb-1">Categoría</label>
        <select value={form.genre ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, genre: e.target.value }))} className="w-full border rounded px-2 py-1" required>
          <option value="">Selecciona género</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <InputField label="Talla (ej: S,M,L)" name="size" value={form.size} onChange={handleChange} required />

      <InputField label="Precio" name="price" type="number" value={form.price} onChange={handleChange} required />

      <div className="mb-3">
        <label className="block mb-1">Stock</label>
        <select value={form.stock ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} className="w-full border rounded px-2 py-1" required>
          <option value="">Selecciona stock</option>
          {stockOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="flex gap-4 mt-4">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Guardando..." : "Aceptar"}
        </button>
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => router.push("/dashboard?opcion=Productos")} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
