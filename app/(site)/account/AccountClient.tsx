"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { MdReceiptLong } from "react-icons/md";
import {
  changePassword,
  clearStoredSession,
  getCurrentUser,
  getStoredAuthToken,
  getStoredUser,
  resendVerification,
  updateProfile,
  updateStoredUser,
} from "@/services/users";
import { listMyOrders } from "@/services/orders";
import type { User } from "@/types/domain/users";
import type {
  AccountProfileFormState,
  ChangePasswordFormState,
} from "@/types/ui/users";

const initialProfileForm: AccountProfileFormState = {
  name: "",
  phone: "",
  address: "",
};

const initialPasswordForm: ChangePasswordFormState = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function AccountClient() {
  const router = useRouter();
  const storedUser = getStoredUser();
  const [isLoading, setIsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [profileForm, setProfileForm] =
    useState<AccountProfileFormState>(initialProfileForm);
  const [passwordForm, setPasswordForm] =
    useState<ChangePasswordFormState>(initialPasswordForm);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = getStoredAuthToken();

    if (!token) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const loadUserAndOrders = async () => {
      try {
        const [user, orderList] = await Promise.all([
          getCurrentUser({ token }),
          listMyOrders({ token }),
        ]);

        setUserInfo(user);
        setOrdersCount(orderList.length);
        setPendingOrdersCount(
          orderList.filter((order) => order.status === "pending").length,
        );
        setProfileForm({
          name: user.name ?? "",
          phone: user.phone ?? "",
          address: user.address ?? "",
        });
      } catch (loadError) {
        clearStoredSession();
        const message =
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar tu perfil";
        toast.error(message);
        router.push("/login?redirect=%2Faccount");
      } finally {
        setIsLoading(false);
        setOrdersLoading(false);
      }
    };

    void loadUserAndOrders();
  }, [router]);

  const refreshOrders = async () => {
    const token = getStoredAuthToken();
    if (!token) return;

    try {
      const orderList = await listMyOrders({ token });
      setOrdersCount(orderList.length);
      setPendingOrdersCount(
        orderList.filter((order) => order.status === "pending").length,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron actualizar tus pedidos";
      toast.error(message);
    }
  };

  const handleResendVerification = async () => {
    const resolvedUserId = userInfo?.id?.trim() || storedUser?.id?.trim() || "";
    const token = getStoredAuthToken();

    if (!resolvedUserId) {
      const message =
        "No pudimos identificar tu cuenta para reenviar el codigo. Cierra sesion e inicia nuevamente.";
      setVerificationMessage(message);
      toast.error(message);
      return;
    }

    setVerificationMessage("");
    setIsResendingVerification(true);

    try {
      const response = await resendVerification(
        { userId: resolvedUserId },
        { token },
      );
      setVerificationMessage(response.message);
      toast.success(response.message);
    } catch (resendError) {
      const message =
        resendError instanceof Error
          ? resendError.message
          : "No se pudo reenviar el codigo de verificacion";
      setVerificationMessage(message);
      toast.error(message);
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setIsSavingProfile(true);

    try {
      const updatedUser = await updateProfile({
        name: profileForm.name.trim() || undefined,
        phone: profileForm.phone.trim() || undefined,
        address: profileForm.address.trim() || undefined,
      });

      setUserInfo(updatedUser);
      setProfileForm({
        name: updatedUser.name ?? "",
        phone: updatedUser.phone ?? "",
        address: updatedUser.address ?? "",
      });
      updateStoredUser(updatedUser);
      toast.success("Perfil actualizado");
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar el perfil";
      setProfileError(message);
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Las contrasenas no coinciden");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm(initialPasswordForm);
      toast.success(response.message || "Contrasena actualizada");
    } catch (changeError) {
      const message =
        changeError instanceof Error
          ? changeError.message
          : "No se pudo cambiar la contrasena";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu cuenta...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona tu informacion personal, tus pedidos y tu acceso.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!userInfo.isEmailVerified && (
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-amber-900">
                  Correo pendiente de verificacion
                </h2>
                <p className="mt-1 text-sm text-amber-800">
                  Tu cuenta aun no esta verificada. Puedes verificarla ahora o
                  reenviar un nuevo codigo a tu correo.
                </p>
                {verificationMessage && (
                  <p className="mt-2 text-sm text-amber-900">
                    {verificationMessage}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/verify?userId=${userInfo.id}`)}
                  className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Verificar ahora
                </button>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="inline-flex items-center rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                  disabled={isResendingVerification}
                >
                  {isResendingVerification
                    ? "Reenviando..."
                    : "Reenviar codigo"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Resumen</h3>
              </div>
              <div className="px-6 py-4 space-y-3 text-sm text-gray-700">
                <div>
                  <span className="font-medium text-gray-900">Usuario:</span>{" "}
                  {userInfo.username}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Email:</span>{" "}
                  {userInfo.email}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Verificado:</span>{" "}
                  {userInfo.isEmailVerified ? "Si" : "No"}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <MdReceiptLong className="text-pink-600" size={20} />
                <h3 className="text-lg font-medium text-gray-900">
                  Mis pedidos
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600">
                  {ordersLoading
                    ? "Cargando pedidos..."
                    : ordersCount === 0
                      ? "Aun no tienes pedidos registrados."
                      : `${ordersCount} pedido${ordersCount === 1 ? "" : "s"} registrado${ordersCount === 1 ? "" : "s"}.`}
                </p>
                {!ordersLoading && pendingOrdersCount > 0 && (
                  <p className="mt-2 text-sm text-amber-700">
                    Tienes {pendingOrdersCount} pedido
                    {pendingOrdersCount === 1 ? "" : "s"} pendiente
                    {pendingOrdersCount === 1 ? "" : "s"}.
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void refreshOrders()}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Actualizar pedidos
                  </button>
                  <Link
                    href="/orders"
                    className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                  >
                    Ver mis pedidos
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Informacion personal
                </h3>
              </div>
              <form
                onSubmit={handleProfileSubmit}
                className="px-6 py-4 space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      className="mt-1 w-full border rounded px-3 py-2"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((current) => ({
                          ...current,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telefono
                    </label>
                    <input
                      className="mt-1 w-full border rounded px-3 py-2"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((current) => ({
                          ...current,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Tu telefono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Usuario
                    </label>
                    <input
                      className="mt-1 w-full border rounded px-3 py-2 bg-gray-50"
                      value={userInfo.username}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      className="mt-1 w-full border rounded px-3 py-2 bg-gray-50"
                      value={userInfo.email}
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Direccion
                  </label>
                  <textarea
                    className="mt-1 w-full border rounded px-3 py-2 min-h-24"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm((current) => ({
                        ...current,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Tu direccion"
                  />
                </div>

                {profileError && (
                  <div className="text-red-500 text-sm">{profileError}</div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-60"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Guardando..." : "Guardar perfil"}
                </button>
              </form>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Cambiar contrasena
                </h3>
              </div>
              <form
                onSubmit={handlePasswordSubmit}
                className="px-6 py-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contrasena actual
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      className="w-full border rounded px-3 py-2 pr-12"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm((current) => ({
                          ...current,
                          oldPassword: e.target.value,
                        }))
                      }
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showOldPassword
                          ? "Ocultar contrasena actual"
                          : "Mostrar contrasena actual"
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowOldPassword((current) => !current)}
                    >
                      {showOldPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nueva contrasena
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="w-full border rounded px-3 py-2 pr-12"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((current) => ({
                          ...current,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showNewPassword
                          ? "Ocultar nueva contrasena"
                          : "Mostrar nueva contrasena"
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPassword((current) => !current)}
                    >
                      {showNewPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmar nueva contrasena
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full border rounded px-3 py-2 pr-12"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((current) => ({
                          ...current,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar confirmacion de contrasena"
                          : "Mostrar confirmacion de contrasena"
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="text-red-500 text-sm">{passwordError}</div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-md text-white bg-gray-900 hover:bg-black disabled:opacity-60"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword
                    ? "Actualizando..."
                    : "Actualizar contrasena"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
