"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { superAdminApi, Admin, AdminStats } from "@/lib/super-admin-api";
import { isSuperAdmin } from "@/lib/auth-utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AdminManagementPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Redirect if not authenticated or not super admin
  if (!authLoading && (!isAuthenticated || !isSuperAdmin(user))) {
    router.replace("/dashboard");
    return null;
  }

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin(user)) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [adminsResult, statsResult] = await Promise.all([
        superAdminApi.getAllAdmins(),
        superAdminApi.getAdminStats(),
      ]);

      if (adminsResult.success && adminsResult.data) {
        setAdmins(adminsResult.data);
      } else {
        setError(adminsResult.message || "Failed to load admins");
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (adminId: string) => {
    if (togglingId) return;

    setTogglingId(adminId);
    const result = await superAdminApi.toggleAdminStatus(adminId);

    if (result.success) {
      await loadData();
    } else {
      alert(result.message || "Failed to update admin status");
    }

    setTogglingId(null);
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete admin "${admin.fullName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(admin.id);
    const result = await superAdminApi.deleteAdmin(admin.id);

    if (result.success) {
      await loadData();
    } else {
      alert(result.message || "Failed to delete admin");
    }

    setDeletingId(null);
  };

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && admin.isActive) ||
      (filterStatus === "inactive" && !admin.isActive);

    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage administrators and their permissions
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/admins/invite")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Invite Admin
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Admins</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Inactive</p>
                  <p className="text-3xl font-bold text-gray-400">
                    {stats.inactive}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Super Admins</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.superAdmins}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                Active
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === "inactive"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Admins List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No admins found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Invite your first admin to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {admin.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {admin.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.isSuperAdmin
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                          {admin.isSuperAdmin ? "Super Admin" : "Admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.creator ? (
                          <div>
                            <div className="font-medium">
                              {admin.creator.fullName}
                            </div>
                            <div className="text-xs">{admin.creator.email}</div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {!admin.isSuperAdmin && admin.id !== user?.id && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(admin.id)}
                                disabled={togglingId === admin.id}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                  admin.isActive
                                    ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    : "bg-green-200 hover:bg-green-300 text-green-700"
                                } disabled:opacity-50`}>
                                {togglingId === admin.id
                                  ? "..."
                                  : admin.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                              <button
                                onClick={() => handleDeleteAdmin(admin)}
                                disabled={deletingId === admin.id}
                                className="px-3 py-1 bg-red-200 hover:bg-red-300 text-red-700 rounded-md text-xs font-medium transition-colors disabled:opacity-50">
                                {deletingId === admin.id ? "..." : "Delete"}
                              </button>
                            </>
                          )}
                          {admin.id === user?.id && (
                            <span className="text-xs text-gray-500 italic">
                              (You)
                            </span>
                          )}
                          {admin.isSuperAdmin && admin.id !== user?.id && (
                            <span className="text-xs text-gray-500 italic">
                              (Protected)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredAdmins.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredAdmins.length} of {admins.length} admin
            {admins.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
