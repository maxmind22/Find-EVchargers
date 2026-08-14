'use client';

import { useEffect, useState, useCallback } from 'react';
import { Station } from '@/lib/types';
import { useAuth } from '@/lib/authContext';
import { AdminAuthCard } from '@/components/admin/AdminAuthCard';
import { AdminUserHeader } from '@/components/admin/AdminUserHeader';
import { AdminStationForm } from '@/components/admin/AdminStationForm';
import { AdminStationList } from '@/components/admin/AdminStationList';
import {
  PlusCircle,
  Layers,
  Loader2,
  ShieldCheck,
  Building,
} from 'lucide-react';

type Tab = 'list' | 'add';

export default function AdminPortalPage() {
  const { user, isSiteAdmin, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [stations, setStations] = useState<Station[]>([]);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminScope, setAdminScope] = useState<'all' | 'mine'>('all');

  const fetchStations = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      // If user is a regular operator OR admin chose "mine" scope, filter by user email
      if (!isSiteAdmin || adminScope === 'mine') {
        params.set('userEmail', user.email);
      }

      const res = await fetch(`/api/stations?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStations(json.data);
      }
    } catch (e) {
      console.warn('Fetch stations error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user, isSiteAdmin, adminScope]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStations();
    }
  }, [isAuthenticated, fetchStations]);

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setActiveTab('add');
  };

  const handleFormSuccess = (savedStation?: Station) => {
    setEditingStation(null);
    setActiveTab('list');
    if (savedStation) {
      setStations((prev) => {
        const exists = prev.some((s) => s.id === savedStation.id);
        if (exists) {
          return prev.map((s) => (s.id === savedStation.id ? savedStation : s));
        }
        return [savedStation, ...prev];
      });
    }
    fetchStations();
  };

  // 1. Loading State
  if (isAuthLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold text-slate-500">Checking Authorization...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render Sign In / Sign Up Card
  if (!isAuthenticated) {
    return (
      <div className="h-full overflow-y-auto bg-slate-50">
        <AdminAuthCard />
      </div>
    );
  }

  // 3. Authenticated: Render Station Manager Console
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                  isSiteAdmin
                    ? 'bg-amber-900 text-amber-100'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {isSiteAdmin ? (
                  <>
                    <ShieldCheck className="h-3 w-3 text-amber-400" />
                    Site Admin (Unrestricted)
                  </>
                ) : (
                  <>
                    <Building className="h-3 w-3 text-brand-400" />
                    Station Host Portal
                  </>
                )}
              </span>
              <span className="text-xs text-slate-400 font-medium">Kigali EV Charging Network</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              {isSiteAdmin ? 'All Network Charging Stations' : 'My Charging Stations'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* User Profile Dropdown & Signout */}
            <AdminUserHeader onAddStationClick={() => setActiveTab('add')} />

            {/* Tab Switcher */}
            <div className="flex items-center rounded-2xl bg-slate-200/70 p-1 shadow-inner text-xs font-bold">
              <button
                onClick={() => {
                  setEditingStation(null);
                  setActiveTab('list');
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all ${
                  activeTab === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{isSiteAdmin ? 'All Stations' : 'My Stations'} ({stations.length})</span>
              </button>

              <button
                onClick={() => {
                  setEditingStation(null);
                  setActiveTab('add');
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all ${
                  activeTab === 'add'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5 text-brand-600" />
                <span>{editingStation ? 'Edit Station' : 'Add Station'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content: 1. Station Directory */}
        {activeTab === 'list' && (
          <AdminStationList
            stations={stations}
            isLoading={isLoading}
            onEditStation={handleEdit}
            onRefresh={fetchStations}
            onAddNew={() => setActiveTab('add')}
          />
        )}

        {/* Tab Content: 2. Add / Edit Station */}
        {activeTab === 'add' && (
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingStation ? `Edit "${editingStation.name}"` : 'Register New Charging Station'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isSiteAdmin
                    ? 'Drop a pin on the Kigali map to publish a new station across the network.'
                    : 'Add your charging station to the Kigali network. You will be able to edit its info at any time.'}
                </p>
              </div>
            </div>

            <AdminStationForm
              initialStation={editingStation}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setEditingStation(null);
                setActiveTab('list');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
