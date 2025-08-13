import { useState } from "react";
import { uploadToCloudinary } from "./cloudinaryUpload";

export interface Producto {
  id?: number;
  name: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  imagePublicId?: string;
}

interface FormProductoProps {
  onCancel: () => void;
  onSuccess: () => void;
  producto?: Producto;
}

export default function FormProducto({
  onCancel,
  onSuccess,
  producto,
}: FormProductoProps) {
  const [form, setForm] = useState<Producto>(
    producto || {
      name: "",
      category: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      imagePublicId: "",
    }
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
        const uploadResult = await uploadToCloudinary(file);
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
        setUploading(false);
      }
      let query = "";
      let variables: any = {};
      if (producto && producto.id) {
        // Edición
        query = `mutation UpdateProduct($input: UpdateProductInput!) { updateProduct(input: $input) { id name price imagePublicId } }`;
        variables = {
          input: {
            id: String(producto.id),
            name: form.name,
            category: form.category,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            imageUrl,
            imagePublicId,
          },
        };
      } else {
        // Creación
        query = `mutation CreateProduct($input: CreateProductInput!) { createProduct(input: $input) { id } }`;
        variables = {
          input: {
            name: form.name,
            category: form.category,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            imageUrl,
            imagePublicId,
          },
        };
      }
      const res = await fetch("https://chikitoslandia.up.railway.app/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      const { errors } = await res.json();
      if (errors) throw new Error(errors[0]?.message || "Error en GraphQL");
      onSuccess();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al crear producto";
      setError(errorMsg);
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
        {producto ? "Editar producto" : "Agregar nuevo producto"}
      </h2>
      <div className="mb-3">
        <div className="mb-3">
          <label className="block mb-1">Imagen (subir archivo o URL)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border rounded px-2 py-1 mb-2"
            disabled={uploading || loading}
          />
          <input
            name="imageUrl"
            type="text"
            placeholder="o pega la URL de la imagen"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            disabled={uploading || loading}
          />
          {uploading && (
            <div className="text-blue-500 mt-1">Subiendo imagen...</div>
          )}
        </div>
        <label className="block mb-1">Nombre</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Categoría</label>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Precio</label>
        <input
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Stock</label>
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
          min="0"
        />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Aceptar"}
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
