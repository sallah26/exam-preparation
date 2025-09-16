"use client";

import React, { useState, useEffect } from "react";
import { superAdminApi } from "@/lib/super-admin-api";
import { AdminUser, CreateAdminData } from "@/types/auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AdminManagementProps {
  onClose?: () => void;
}

export function AdminManagement({ onClose }: AdminManagementProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Create admin form state
  const [createForm, setCreateForm] = useState<CreateAdminData>({
    fullName: "",
    email: "",
    password: "",
    isSuperAdmin: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      const [adminsResponse, statsResponse] = await Promise.all([
        superAdminApi.getAllAdmins(),
        superAdminApi.getSystemStats(),
      ]);

      console.log("Admins response:", adminsResponse);
      console.log("Stats response:", statsResponse);

      if (adminsResponse.success && adminsResponse.data) {
        // Ensure we have an array
        const adminData = Array.isArray(adminsResponse.data)
          ? adminsResponse.data
          : [];
        setAdmins(adminData);
      } else {
        setError(adminsResponse.message || "Failed to load admins");
        setAdmins([]); // Set empty array on error
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data.stats);
      } else {
        console.warn("Failed to load stats:", statsResponse.message);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError("Failed to load admin data");
      setAdmins([]); // Ensure admins is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await superAdminApi.createAdmin(createForm);

      if (response.success) {
        setShowCreateForm(false);
        setCreateForm({
          fullName: "",
          email: "",
          password: "",
          isSuperAdmin: false,
        });
        await loadData(); // Reload the admin list
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to create admin");
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to delete admin: ${adminEmail}?`)) {
      return;
    }

    try {
      const response = await superAdminApi.deleteAdmin(adminId);

      if (response.success) {
        await loadData(); // Reload the admin list
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to delete admin");
    }
  };

  const handleToggleAdminStatus = async (
    adminId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await superAdminApi.updateAdmin(adminId, {
        isActive: !currentStatus,
      });

      if (response.success) {
        await loadData(); // Reload the admin list
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to update admin status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
          <p className="text-gray-600">
            Manage administrators and view system statistics
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Add New Admin
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm mt-2">
            Dismiss
          </button>
        </div>
      )}

      {/* System Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admins</h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Total: {stats.admins.total}
              </p>
              <p className="text-sm text-gray-600">
                Active: {stats.admins.active}
              </p>
              <p className="text-sm text-gray-600">
                Super Admins: {stats.admins.superAdmins}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Total: {stats.users.total}
              </p>
              <p className="text-sm text-gray-600">
                Active: {stats.users.active}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Content
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Exam Types: {stats.content.examTypes}
              </p>
              <p className="text-sm text-gray-600">
                Departments: {stats.content.departments}
              </p>
              <p className="text-sm text-gray-600">
                Materials: {stats.content.materials}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Admin
          </h3>
          <form
            onSubmit={handleCreateAdmin}
            className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={createForm.fullName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSuperAdmin"
                checked={createForm.isSuperAdmin}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    isSuperAdmin: e.target.checked,
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isSuperAdmin"
                className="ml-2 block text-sm text-gray-900">
                Make Super Admin
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Create Admin
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            All Administrators
          </h3>
        </div>
        <div className="overflow-x-auto">
          {admins && admins.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id}>
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
                          admin.isSuperAdmin
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                        {admin.isSuperAdmin ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() =>
                          handleToggleAdminStatus(admin.id, admin.isActive)
                        }
                        className={`text-xs px-2 py-1 rounded ${
                          admin.isActive
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}>
                        {admin.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No administrators found
              </h3>
              <p className="text-gray-600">
                There are no administrators to display at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
