"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";

// ----- Tipos -----
export interface Producto {
  id?: string;
  name: string;
  description: string;
  genre: string;
  size: string;
  price: string;
  stock: string;
  imageUrl: string;
  imagePublicId?: string;
}

type FormProductoModo = "crear" | "editar";

interface FormProductoProps {
  producto?: Producto;
  modo?: FormProductoModo;
  id?: string;
}

// ----- Componente de input reutilizable -----
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
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1"
        required={required}
      />
    ) : (
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1"
        required={required}
      />
    )}
  </div>
);

// ----- Componente principal -----
export default function FormProducto({ modo, producto }: FormProductoProps) {
  const router = useRouter();

  const [form, setForm] = useState<Producto>(
    producto || {
      name: "",
      genre: "",
      description: "",
      size: "",
      price: "",
      stock: "",
      imageUrl: "",
      imagePublicId: "",
    }
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genres = ["niña", "niño", "unisex"];
  const stockOptions = Array.from({ length: 101 }, (_, i) => i);

  // ----- Handlers -----
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setForm((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let imageUrl = form.imageUrl;
    let imagePublicId = form.imagePublicId;

    try {
      if (file) {
        setUploading(true);
        const upload = await uploadToCloudinary(file);
        imageUrl = upload.secure_url;
        imagePublicId = upload.public_id;
        setUploading(false);
      }

      const sizeArray = form.size
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const variables: any = {
        input: {
          ...form,
          size: sizeArray,
          price: Number(form.price) || 0,
          stock: Number(form.stock) || 0,
          imageUrl,
          imagePublicId,
        },
      };

      const query =
        modo === "editar" && producto?.id
          ? `mutation UpdateProduct($input: UpdateProductInput!) { updateProduct(input: $input) { id name price imagePublicId } }`
          : `mutation CreateProduct($input: CreateProductInput!) { createProduct(input: $input) { id } }`;

      if (modo === "editar" && producto?.id)
        variables.input.id = String(producto.id);

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      const { errors } = await res.json();
      if (errors) throw new Error(errors[0]?.message || "Error en GraphQL");

      router.push("/dashboard?opcion=Productos");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar producto"
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4">
        {modo === "editar" ? "Editar producto" : "Agregar nuevo producto"}
      </h2>

      {/* Imagen */}
      <div className="mb-3">
        <label className="block mb-1">Imagen (subir archivo o URL)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border rounded px-2 py-1 mb-2"
          disabled={uploading || loading}
        />
        {uploading && (
          <div className="text-blue-500 mt-1">Subiendo imagen...</div>
        )}
        {form.imageUrl && (
          <div className="mt-2 flex justify-center">
            <img
              src={form.imageUrl}
              alt="Vista previa"
              className="max-h-40 rounded shadow"
            />
          </div>
        )}
      </div>

      {/* Inputs reutilizables */}
      <InputField
        label="Nombre"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <InputField
        label="Descripción"
        name="description"
        value={form.description}
        onChange={handleChange}
        type="textarea"
        required
      />
      <div className="mb-3">
        <label className="block mb-1">Categoría</label>
        <select
          value={form.genre ?? ""}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          className="w-full border rounded px-2 py-1"
          required
        >
          <option value="">Selecciona género</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <InputField
        label="Talla"
        name="size"
        value={form.size}
        onChange={handleChange}
        required
      />
      <InputField
        label="Precio"
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        required
      />

      {/* Stock */}
      <div className="mb-3">
        <label className="block mb-1">Stock</label>
        <select
          value={form.stock ?? ""}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full border rounded px-2 py-1"
          required
        >
          <option value="">Selecciona stock</option>
          {stockOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {/* Botones */}
      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading || uploading}
        >
          {loading ? "Guardando..." : "Aceptar"}
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => router.push("/dashboard?opcion=Productos")}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
