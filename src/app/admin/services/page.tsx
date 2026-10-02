"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/types";
import { Heart, Gift, Star, Briefcase, Home, Camera } from "lucide-react";

const ICON_OPTIONS = ["Heart", "Gift", "Star", "Briefcase", "Home", "Camera"];

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", description: "", icon: "" });
  const [newData, setNewData] = useState({ title: "", description: "", icon: "Star" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("created_at");
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleAdd = async () => {
    if (!newData.title.trim()) { toast.error("Title is required"); return; }
    setAdding(true);
    const { error } = await supabase.from("services").insert(newData);
    if (error) toast.error("Failed to add service");
    else { toast.success("Service added successfully"); setNewData({ title: "", description: "", icon: "Star" }); fetchServices(); }
    setAdding(false);
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    const { error } = await supabase.from("services").update(editData).eq("id", editId);
    if (error) toast.error("Failed to update service");
    else { toast.success("Service updated"); setEditId(null); fetchServices(); }
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete service "${title}"?`)) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast.error("Failed to delete service");
    else { toast.success("Service deleted"); fetchServices(); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-navy-900">Services</h1>
        <p className="text-navy-500 text-sm mt-1">Manage the services shown on the public Services page.</p>
      </div>

      {/* Add new */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-navy-800 mb-4">Add Service</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="svc-title" className="input-label">Title</label>
            <input id="svc-title" type="text" placeholder="e.g. Anniversary Decoration" className="input-field" value={newData.title} onChange={(e) => setNewData({ ...newData, title: e.target.value })} />
          </div>
          <div>
            <label htmlFor="svc-icon" className="input-label">Icon</label>
            <select id="svc-icon" className="input-field" value={newData.icon} onChange={(e) => setNewData({ ...newData, icon: e.target.value })}>
              {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="svc-desc" className="input-label">Description</label>
          <textarea id="svc-desc" rows={2} className="input-field resize-none" value={newData.description} onChange={(e) => setNewData({ ...newData, description: e.target.value })} />
        </div>
        <button onClick={handleAdd} disabled={adding} className="btn-primary">
          {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add Service
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-8 animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-cream-200 rounded" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="card p-5">
              {editId === svc.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" className="input-field text-sm" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                    <select className="input-field text-sm" value={editData.icon} onChange={(e) => setEditData({ ...editData, icon: e.target.value })}>
                      {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <textarea rows={2} className="input-field text-sm resize-none w-full" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-4">
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      Save
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-ghost text-xs py-2 px-3"><X size={13} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                    <Star size={18} className="text-gold-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-800 text-sm">{svc.title}</p>
                    <p className="text-navy-500 text-xs mt-0.5 line-clamp-2">{svc.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setEditId(svc.id); setEditData({ title: svc.title, description: svc.description || "", icon: svc.icon || "Star" }); }} className="btn-ghost text-xs py-1.5 px-2.5">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(svc.id, svc.title)} className="flex items-center px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
