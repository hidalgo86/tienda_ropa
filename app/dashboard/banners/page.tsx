"use client";

import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import {
  createBanner,
  deleteBanner,
  listAdminBanners,
  updateBanner,
  uploadBannerImage,
} from "@/services/banners";
import type { Banner } from "@/types/domain/banners";

type BannerDraft = {
  title: string;
  altText: string;
  subtitle: string;
  linkUrl: string;
  ctaLabel: string;
  order: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  imageUrl: string;
  imagePublicId: string;
};

const emptyDraft: BannerDraft = {
  title: "",
  altText: "",
  subtitle: "",
  linkUrl: "",
  ctaLabel: "",
  order: "0",
  isActive: true,
  startsAt: "",
  endsAt: "",
  imageUrl: "",
  imagePublicId: "",
};

const toDateTimeLocalValue = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toDraft = (banner: Banner): BannerDraft => ({
  title: banner.title,
  altText: banner.altText,
  subtitle: banner.subtitle || "",
  linkUrl: banner.linkUrl || "",
  ctaLabel: banner.ctaLabel || "",
  order: String(banner.order),
  isActive: banner.isActive,
  startsAt: toDateTimeLocalValue(banner.startsAt),
  endsAt: toDateTimeLocalValue(banner.endsAt),
  imageUrl: banner.imageUrl,
  imagePublicId: banner.imagePublicId || "",
});

const parseOptionalDateTime = (value: string): string | null =>
  value.trim() ? new Date(value).toISOString() : null;

export default function DashboardBannersPage() {
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [drafts, setDrafts] = React.useState<Record<string, BannerDraft>>({});
  const [createDraft, setCreateDraft] = React.useState<BannerDraft>(emptyDraft);
  const [createFile, setCreateFile] = React.useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = React.useState<
    Record<string, File | null>
  >({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [draggedBannerId, setDraggedBannerId] = React.useState<string | null>(
    null,
  );
  const [orderDirty, setOrderDirty] = React.useState(false);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);

  const syncState = React.useCallback((items: Banner[]) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    setBanners(sorted);
    setDrafts(
      Object.fromEntries(sorted.map((banner) => [banner.id, toDraft(banner)])),
    );
    setOrderDirty(false);
  }, []);

  const loadBanners = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const items = await listAdminBanners();
      syncState(items);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudieron cargar banners",
      );
    } finally {
      setIsLoading(false);
    }
  }, [syncState]);

  React.useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  const handleCreateChange = (
    field: keyof BannerDraft,
    value: string | boolean,
  ) => {
    setCreateDraft((current) => ({ ...current, [field]: value }));
  };

  const handleDraftChange = (
    id: string,
    field: keyof BannerDraft,
    value: string | boolean,
  ) => {
    if (field === "order") {
      setOrderDirty(true);
    }

    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createDraft.title.trim()) {
      toast.error("El banner necesita un titulo");
      return;
    }

    if (!createFile) {
      toast.error("Selecciona una imagen para el banner");
      return;
    }

    setIsCreating(true);

    try {
      const uploadedImage = await uploadBannerImage(createFile);
      const created = await createBanner({
        title: createDraft.title.trim(),
        altText: createDraft.altText.trim() || createDraft.title.trim(),
        subtitle: createDraft.subtitle.trim() || undefined,
        linkUrl: createDraft.linkUrl.trim() || undefined,
        ctaLabel: createDraft.ctaLabel.trim() || undefined,
        order: Number(createDraft.order) || 0,
        isActive: createDraft.isActive,
        startsAt: parseOptionalDateTime(createDraft.startsAt),
        endsAt: parseOptionalDateTime(createDraft.endsAt),
        imageUrl: uploadedImage.url,
        imagePublicId: uploadedImage.publicId,
      });

      syncState([created, ...banners]);
      setCreateDraft(emptyDraft);
      setCreateFile(null);
      toast.success("Banner creado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error creando banner");
    } finally {
      setIsCreating(false);
    }
  };

  const reorderBanners = React.useCallback(
    (items: Banner[]): Banner[] =>
      items.map((banner, index) => ({
        ...banner,
        order: index,
      })),
    [],
  );

  const syncDraftOrders = React.useCallback((items: Banner[]) => {
    setDrafts((current) => {
      const nextDrafts = { ...current };
      for (const banner of items) {
        if (!nextDrafts[banner.id]) continue;
        nextDrafts[banner.id] = {
          ...nextDrafts[banner.id],
          order: String(banner.order),
        };
      }
      return nextDrafts;
    });
  }, []);

  const handleDropOnBanner = React.useCallback(
    (targetBannerId: string) => {
      if (!draggedBannerId || draggedBannerId === targetBannerId) {
        setDraggedBannerId(null);
        return;
      }

      setBanners((current) => {
        const sourceIndex = current.findIndex(
          (banner) => banner.id === draggedBannerId,
        );
        const targetIndex = current.findIndex(
          (banner) => banner.id === targetBannerId,
        );

        if (sourceIndex === -1 || targetIndex === -1) {
          return current;
        }

        const nextItems = [...current];
        const [movedBanner] = nextItems.splice(sourceIndex, 1);
        nextItems.splice(targetIndex, 0, movedBanner);

        const reordered = reorderBanners(nextItems);
        syncDraftOrders(reordered);
        return reordered;
      });

      setOrderDirty(true);
      setDraggedBannerId(null);
    },
    [draggedBannerId, reorderBanners, syncDraftOrders],
  );

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);

    try {
      const orderedBanners = [...banners].sort((a, b) => a.order - b.order);
      const updatedBanners = await Promise.all(
        orderedBanners.map((banner, index) =>
          updateBanner(banner.id, { order: index }),
        ),
      );

      syncState(updatedBanners);
      toast.success("Orden del carrusel actualizado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar el orden",
      );
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleSave = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    setBusyId(id);

    try {
      let imageUrl = draft.imageUrl;
      let imagePublicId = draft.imagePublicId;
      const pendingFile = pendingFiles[id];

      if (pendingFile) {
        const uploadedImage = await uploadBannerImage(pendingFile);
        imageUrl = uploadedImage.url;
        imagePublicId = uploadedImage.publicId;
      }

      const updated = await updateBanner(id, {
        title: draft.title.trim(),
        altText: draft.altText.trim() || draft.title.trim(),
        subtitle: draft.subtitle.trim() || undefined,
        linkUrl: draft.linkUrl.trim() || undefined,
        ctaLabel: draft.ctaLabel.trim() || undefined,
        order: Number(draft.order) || 0,
        isActive: draft.isActive,
        startsAt: parseOptionalDateTime(draft.startsAt),
        endsAt: parseOptionalDateTime(draft.endsAt),
        imageUrl,
        imagePublicId,
      });

      syncState(banners.map((banner) => (banner.id === id ? updated : banner)));
      setPendingFiles((current) => ({ ...current, [id]: null }));
      toast.success("Banner actualizado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error actualizando banner",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Quieres eliminar este banner?")) {
      return;
    }

    setBusyId(id);

    try {
      await deleteBanner(id);
      const nextItems = banners.filter((banner) => banner.id !== id);
      syncState(nextItems);
      toast.success("Banner eliminado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error eliminando");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Gestion del carrusel
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Aqui decides que banners se muestran en la portada, su orden y si
          estan activos.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo banner</h2>
          <p className="mt-1 text-sm text-gray-500">
            Consejo: usa imagenes horizontales y un orden menor para que salgan
            primero.
          </p>
        </div>

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Titulo
            </label>
            <input
              value={createDraft.title}
              onChange={(e) => handleCreateChange("title", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Promo de temporada"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Texto alternativo
            </label>
            <input
              value={createDraft.altText}
              onChange={(e) => handleCreateChange("altText", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Banner promocional"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subtitulo opcional
            </label>
            <input
              value={createDraft.subtitle}
              onChange={(e) => handleCreateChange("subtitle", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Hasta 40% en prendas seleccionadas"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Enlace opcional
            </label>
            <input
              value={createDraft.linkUrl}
              onChange={(e) => handleCreateChange("linkUrl", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Texto del boton CTA
            </label>
            <input
              value={createDraft.ctaLabel}
              onChange={(e) => handleCreateChange("ctaLabel", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Comprar ahora"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Orden
            </label>
            <input
              type="number"
              min="0"
              value={createDraft.order}
              onChange={(e) => handleCreateChange("order", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Inicio programado
            </label>
            <input
              type="datetime-local"
              value={createDraft.startsAt}
              onChange={(e) => handleCreateChange("startsAt", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fin programado
            </label>
            <input
              type="datetime-local"
              value={createDraft.endsAt}
              onChange={(e) => handleCreateChange("endsAt", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCreateFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
            <input
              type="checkbox"
              checked={createDraft.isActive}
              onChange={(e) => handleCreateChange("isActive", e.target.checked)}
            />
            Mostrar este banner en el carrusel
          </label>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex w-full items-center justify-center rounded-lg bg-pink-600 px-5 py-2.5 text-white hover:bg-pink-700 disabled:opacity-60 sm:w-auto"
            >
              {isCreating ? "Guardando..." : "Crear banner"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Banners actuales
            </h2>
            <p className="text-sm text-gray-500">
              Arrastra las tarjetas para cambiar el orden visual del carrusel.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{banners.length} total</span>
            <button
              type="button"
              onClick={() => void handleSaveOrder()}
              disabled={!orderDirty || isSavingOrder}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingOrder ? "Guardando orden..." : "Guardar orden"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
            Cargando banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Aun no has creado banners para el carrusel.
          </div>
        ) : (
          banners.map((banner) => {
            const draft = drafts[banner.id];
            const isBusy = busyId === banner.id;

            if (!draft) return null;

            return (
              <article
                key={banner.id}
                draggable
                onDragStart={() => setDraggedBannerId(banner.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnBanner(banner.id)}
                onDragEnd={() => setDraggedBannerId(null)}
                className={`grid grid-cols-1 gap-5 rounded-2xl border bg-white p-5 shadow-sm transition lg:grid-cols-[240px_1fr] ${
                  draggedBannerId === banner.id
                    ? "border-pink-400 opacity-70"
                    : "border-gray-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={draft.imageUrl || "/placeholder.webp"}
                      alt={draft.altText || draft.title || "Banner"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 240px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-base font-semibold line-clamp-2">
                        {draft.title || "Titulo del banner"}
                      </p>
                      {draft.subtitle && (
                        <p className="mt-1 text-xs text-white/90 line-clamp-2">
                          {draft.subtitle}
                        </p>
                      )}
                      {draft.ctaLabel && (
                        <span className="mt-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900">
                          {draft.ctaLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPendingFiles((current) => ({
                        ...current,
                        [banner.id]: e.target.files?.[0] ?? null,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  {pendingFiles[banner.id] && (
                    <p className="text-xs text-amber-700">
                      Nueva imagen seleccionada: {pendingFiles[banner.id]?.name}
                    </p>
                  )}
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    Posicion actual: {banner.order + 1}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Titulo
                    </label>
                    <input
                      value={draft.title}
                      onChange={(e) =>
                        handleDraftChange(banner.id, "title", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Texto alternativo
                    </label>
                    <input
                      value={draft.altText}
                      onChange={(e) =>
                        handleDraftChange(banner.id, "altText", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Subtitulo opcional
                    </label>
                    <input
                      value={draft.subtitle}
                      onChange={(e) =>
                        handleDraftChange(banner.id, "subtitle", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Enlace opcional
                    </label>
                    <input
                      value={draft.linkUrl}
                      onChange={(e) =>
                        handleDraftChange(banner.id, "linkUrl", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Texto del boton CTA
                    </label>
                    <input
                      value={draft.ctaLabel}
                      onChange={(e) =>
                        handleDraftChange(banner.id, "ctaLabel", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Orden
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={draft.order}
                      onChange={(e) =>
                        handleDraftChange(banner.id, "order", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Inicio programado
                    </label>
                    <input
                      type="datetime-local"
                      value={draft.startsAt}
                      onChange={(e) =>
                        handleDraftChange(banner.id, "startsAt", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Fin programado
                    </label>
                    <input
                      type="datetime-local"
                      value={draft.endsAt}
                      onChange={(e) =>
                        handleDraftChange(banner.id, "endsAt", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={(e) =>
                        handleDraftChange(
                          banner.id,
                          "isActive",
                          e.target.checked,
                        )
                      }
                    />
                    Banner activo
                  </label>

                  <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => void handleDelete(banner.id)}
                      disabled={isBusy}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-60 sm:w-auto"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave(banner.id)}
                      disabled={isBusy}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black disabled:opacity-60 sm:w-auto"
                    >
                      {isBusy ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
