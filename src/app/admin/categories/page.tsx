"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error("Category name is required"); return; }
    setAdding(true);
    const { error } = await supabase.from("categories").insert({ name: newName.trim() });
    if (error) {
      toast.error(error.code === "23505" ? "A category with this name already exists" : "Failed to add category");
    } else {
      toast.success("Category added successfully");
      setNewName("");
      fetchCategories();
    }
    setAdding(false);
  };

  const handleSave = async () => {
    if (!editId || !editName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("categories").update({ name: editName.trim() }).eq("id", editId);
    if (error) {
      toast.error("Failed to update category");
    } else {
      toast.success("Category updated");
      setEditId(null);
      fetchCategories();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Designs in this category will be uncategorised.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error("Failed to delete category");
    else { toast.success("Category deleted"); fetchCategories(); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-navy-900">Categories</h1>
        <p className="text-navy-500 text-sm mt-1">Manage design categories for filtering in the gallery.</p>
      </div>

      {/* Add new */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-navy-800 mb-3">Add Category</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. Reception"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="input-field flex-1"
            id="new-category-input"
          />
          <button onClick={handleAdd} disabled={adding} className="btn-primary shrink-0">
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-8 animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-cream-200 rounded" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-navy-400 text-sm">No categories yet.</div>
          ) : (
            <div className="divide-y divide-cream-200">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 px-5 py-3">
                  {editId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-field flex-1 py-2 text-sm"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditId(null); }}
                      />
                      <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-3">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Save
                      </button>
                      <button onClick={() => setEditId(null)} className="btn-ghost text-xs py-2 px-3">
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-navy-800 text-sm font-medium">{cat.name}</span>
                      <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="btn-ghost text-xs py-1.5 px-2.5">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
