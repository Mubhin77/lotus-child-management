import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

interface Parent {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address: string;
  is_active: boolean;
}

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  parents: number[];
}

interface ParentForm {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  phone: string;
  address: string;
  children: string[];
}

const emptyForm: ParentForm = {
  first_name: "",
  last_name: "",
  username: "",
  password: "",
  phone: "",
  address: "",
  children: [],
};

function Parents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingParent, setEditingParent] =
    useState<Parent | null>(null);

  const [form, setForm] = useState<ParentForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        parentsResponse,
        childrenResponse,
      ] = await Promise.all([
        api.get("/parents/"),
        api.get("/children/"),
      ]);

      setParents(parentsResponse.data);
      setChildren(childrenResponse.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load parent data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      const fullName =
        `${parent.first_name} ${parent.last_name}`.toLowerCase();

      return (
        fullName.includes(search.toLowerCase()) ||
        parent.username
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        parent.phone
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [parents, search]);

  const getParentChildren = (parentId: number) => {
    return children
      .filter((child) =>
        child.parents.includes(parentId)
      )
      .map(
        (child) =>
          `${child.first_name} ${child.last_name}`
      );
  };

  const openAddForm = () => {
    setEditingParent(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (parent: Parent) => {
    const assignedChildren = children
      .filter((child) =>
        child.parents.includes(parent.id)
      )
      .map((child) => String(child.id));

    setEditingParent(parent);

    setForm({
      first_name: parent.first_name,
      last_name: parent.last_name,
      username: parent.username,
      password: "",
      phone: parent.phone,
      address: parent.address,
      children: assignedChildren,
    });

    setError("");
    setShowForm(true);
  };

  const handleChildToggle = (childId: string) => {
    setForm((current) => ({
      ...current,
      children: current.children.includes(childId)
        ? current.children.filter(
            (id) => id !== childId
          )
        : [...current.children, childId],
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      let parentId: number;

      if (editingParent) {
        await api.patch(
          `/parents/${editingParent.id}/`,
          {
            phone: form.phone,
            address: form.address,
          }
        );

        parentId = editingParent.id;
      } else {
        if (!form.password) {
          setError(
            "Password is required when creating a parent."
          );
          setSaving(false);
          return;
        }

        const response = await api.post(
          "/parents/create-account/",
          {
            first_name: form.first_name,
            last_name: form.last_name,
            username: form.username,
            password: form.password,
            phone: form.phone,
            address: form.address,
          }
        );

        parentId = response.data.id;
      }

      /*
       * Update child-parent relationships.
       *
       * Each child currently stores its parent IDs,
       * so we update the selected children here.
       */
      const selectedChildren = new Set(
        form.children.map(Number)
      );

      // const currentChildren = children.filter((child) =>
      //   child.parents.includes(parentId)
      // );

      for (const child of children) {
        const currentlyAssigned =
          child.parents.includes(parentId);

        const shouldBeAssigned =
          selectedChildren.has(child.id);

        if (
          currentlyAssigned !== shouldBeAssigned
        ) {
          let updatedParents = child.parents;

          if (shouldBeAssigned) {
            updatedParents = [
              ...child.parents,
              parentId,
            ];
          } else {
            updatedParents = child.parents.filter(
              (id) => id !== parentId
            );
          }

          await api.patch(
            `/children/${child.id}/`,
            {
              parents: updatedParents,
            }
          );
        }
      }

      setShowForm(false);
      setEditingParent(null);
      setForm(emptyForm);

      await loadData();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.detail ||
        "Failed to save parent.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // const toggleStatus = async (parent: Parent) => {
  //   try {
  //     await api.patch(
  //       `/parents/${parent.id}/`,
  //       {
  //         user: parent.user,
  //       }
  //     );

  //     setError(
  //       "Parent account status management will be added with the user-account endpoint."
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to update parent.");
  //   }
  // };

  return (
    // <div className="min-h-screen p-8">
    <div className="w-full space-y-6">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Parents
          </h1>

          <p className="mt-1 text-gray-500">
            Manage parent accounts and child relationships.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-md hover:opacity-90"
        >
          + Add Parent
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search */}

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

        <input
          type="text"
          placeholder="Search parents..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 md:max-w-md"
        />

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead className="border-b border-gray-100 bg-gray-50">

              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Parent
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Username
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Children
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading parents...
                  </td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No parents found.
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => {
                  const parentChildren =
                    getParentChildren(parent.id);

                  return (
                    <tr
                      key={parent.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                            {parent.first_name.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {parent.first_name}{" "}
                              {parent.last_name}
                            </p>

                            <p className="text-xs text-gray-400">
                              Parent
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {parent.username}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {parent.phone || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {parentChildren.length > 0
                          ? parentChildren.join(", ")
                          : "No children assigned"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            parent.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {parent.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditForm(parent)
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
                          >
                            Edit
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Modal */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingParent
                    ? "Edit Parent"
                    : "Add Parent"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingParent
                    ? "Update parent information and children."
                    : "Create a parent account and assign children."}
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-full px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Names */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    First Name
                  </label>

                  <input
                    required
                    disabled={!!editingParent}
                    value={form.first_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        first_name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>

                  <input
                    disabled={!!editingParent}
                    value={form.last_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        last_name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                  />
                </div>

              </div>

              {/* Account */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Username
                  </label>

                  <input
                    required
                    disabled={!!editingParent}
                    value={form.username}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        username: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <input
                    required={!editingParent}
                    disabled={!!editingParent}
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        password: event.target.value,
                      })
                    }
                    placeholder={
                      editingParent
                        ? "Password reset will be added later"
                        : "Create temporary password"
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                  />
                </div>

              </div>

              {/* Contact */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Children */}

              <div>

                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Assign Children
                </label>

                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3">

                  {children.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No children available.
                    </p>
                  ) : (
                    children.map((child) => (
                      <label
                        key={child.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={form.children.includes(
                            String(child.id)
                          )}
                          onChange={() =>
                            handleChildToggle(
                              String(child.id)
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-purple-600"
                        />

                        <span className="text-sm text-gray-700">
                          {child.first_name}{" "}
                          {child.last_name}
                        </span>
                      </label>
                    ))
                  )}

                </div>

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-md disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingParent
                    ? "Save Changes"
                    : "Create Parent"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Parents;