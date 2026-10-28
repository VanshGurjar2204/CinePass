import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({ search, limit: 100 });
      if (res.data.success) {
        setUsers(res.data.data.users || []);
      }
    } catch {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    if (user.role === "admin") {
      showToast("Cannot deactivate an administrator account", "error");
      return;
    }

    try {
      const res = await adminApi.toggleUserStatus(user._id);
      if (res.data.success) {
        showToast(res.data.message, "success");
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to toggle user status", "error");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Registered Users</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View customer accounts, roles, and manage access status.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0e1626]/90 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80">
          <Input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </form>
      </div>

      <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
        {loading ? (
          <Loader text="Loading user accounts..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{u.phone || "N/A"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={u.role === "admin" ? "indigo" : "slate"} size="sm">
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={u.isActive ? "emerald" : "rose"} size="sm">
                          {u.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== "admin" && (
                          <Button
                            variant={u.isActive ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleToggleStatus(u)}
                            className={u.isActive ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer" : "text-emerald-600 dark:text-emerald-400 cursor-pointer"}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
