'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AccessType, Amenity, Connector, Station, StationStatus } from '@/lib/types';
import { ConnectorBuilder } from './ConnectorBuilder';
import { useAuth } from '@/lib/authContext';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Info,
} from 'lucide-react';

const MapPinPicker = dynamic(
  () => import('../map/MapPinPicker').then((mod) => mod.MapPinPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex flex-col items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600 mb-2" />
        <span className="text-xs font-semibold text-slate-500">Loading Map Picker...</span>
      </div>
    ),
  }
);

interface AdminStationFormProps {
  initialStation?: Station | null;
  onSuccess: (station: Station) => void;
  onCancel?: () => void;
}

const AMENITY_OPTIONS: { id: Amenity; label: string }[] = [
  { id: 'TWENTY_FOUR_SEVEN', label: '24/7 Access' },
  { id: 'RESTROOM', label: 'Restrooms' },
  { id: 'COFFEE', label: 'Coffee / Cafe' },
  { id: 'RESTAURANT', label: 'Dining' },
  { id: 'SHOPPING', label: 'Shopping Mall / Supermarket' },
  { id: 'WIFI', label: 'Free WiFi' },
  { id: 'HOTEL', label: 'Hotel On-site' },
  { id: 'ACCESSIBLE', label: 'Wheelchair Accessible' },
];

export function AdminStationForm({
  initialStation,
  onSuccess,
  onCancel,
}: AdminStationFormProps) {
  const { user } = useAuth();
  const isEditing = Boolean(initialStation?.id);

  // Form State (Defaults to Kigali, Rwanda)
  const [name, setName] = useState(initialStation?.name || '');
  const [operatorName, setOperatorName] = useState(initialStation?.operator_name || 'Independent Operator');
  const [address, setAddress] = useState(initialStation?.address || '');
  const [city, setCity] = useState(initialStation?.city || 'Kigali');
  const [country, setCountry] = useState(initialStation?.country || 'Rwanda');
  const [latitude, setLatitude] = useState(initialStation?.latitude || -1.9536);
  const [longitude, setLongitude] = useState(initialStation?.longitude || 30.0924);
  const [status, setStatus] = useState<StationStatus>(initialStation?.status || 'ACTIVE');
  const [pricingInfo, setPricingInfo] = useState(initialStation?.pricing_info || '280 RWF / kWh');
  const [isFree, setIsFree] = useState(initialStation?.is_free || false);
  const [accessType, setAccessType] = useState<AccessType>(initialStation?.access_type || 'PUBLIC');
  const [amenities, setAmenities] = useState<Amenity[]>(initialStation?.amenities || ['TWENTY_FOUR_SEVEN', 'WIFI']);
  const [notes, setNotes] = useState(initialStation?.notes || '');
  const [connectors, setConnectors] = useState<Omit<Connector, 'id' | 'station_id'>[]>(
    initialStation?.connectors || [
      {
        connector_type: 'GB_T',
        power_kw: 120,
        quantity: 2,
        status: 'AVAILABLE',
        current_type: 'DC',
      },
      {
        connector_type: 'CCS_2',
        power_kw: 150,
        quantity: 2,
        status: 'AVAILABLE',
        current_type: 'DC',
      },
      {
        connector_type: 'TYPE_2',
        power_kw: 22,
        quantity: 2,
        status: 'AVAILABLE',
        current_type: 'AC',
      },
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLocationChange = (
    lat: number,
    lng: number,
    autoAddress?: string,
    autoCity?: string,
    autoCountry?: string
  ) => {
    setLatitude(lat);
    setLongitude(lng);
    if (autoAddress && (!address || address.length < 5)) {
      setAddress(autoAddress);
    }
    if (autoCity && !city) {
      setCity(autoCity);
    }
    if (autoCountry && !country) {
      setCountry(autoCountry);
    }
  };

  const toggleAmenity = (amenity: Amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter a station name.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter or select a valid address.');
      return;
    }
    if (connectors.length === 0) {
      setErrorMsg('Please add at least one charging plug.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Resolve user details
      const resolvedUserEmail =
        initialStation?.user_email ||
        user?.email ||
        (typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('evchargers_admin_session') || '{}')?.email
          : '') ||
        'admin@evchargers.rw';

      const resolvedUserId =
        initialStation?.user_id ||
        user?.id ||
        (typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('evchargers_admin_session') || '{}')?.id
          : '') ||
        'usr-admin-01';

      const payload = {
        name: name.trim(),
        operator_name: (operatorName || 'Independent Operator').trim(),
        address: address.trim(),
        city: (city || 'Kigali').trim(),
        country: (country || 'Rwanda').trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        status,
        pricing_info: pricingInfo || 'Standard rate',
        is_free: Boolean(isFree),
        access_type: accessType,
        amenities,
        notes: notes || '',
        connectors,
        user_id: resolvedUserId,
        user_email: resolvedUserEmail,
      };

      const url = isEditing ? `/api/stations/${initialStation!.id}` : '/api/stations';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save station');
      }

      setSuccessMsg(isEditing ? 'Station updated successfully!' : 'Station created successfully!');
      setTimeout(() => {
        onSuccess(json.data);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while saving the station');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 border border-rose-200 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Pin-Drop Coordinate Picker */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-brand-600" />
              1. Location & Map Coordinates
            </h3>
            <p className="text-xs text-slate-500">
              Click anywhere on the Kigali map or drag the pin to set the exact station position.
            </p>
          </div>
        </div>

        <MapPinPicker
          latitude={latitude}
          longitude={longitude}
          onChangeLocation={handleLocationChange}
        />
      </div>

      {/* 2. Station Metadata */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-brand-600" />
          2. Station Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Station Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kigali Convention Centre Fast Hub"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Operator / Network</label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="e.g., REG, Ampersand, Spiro, BasiGo"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block font-semibold text-slate-700">Street Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., KG 2 Roundabout, Kimihurura, Kigali"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Operational Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StationStatus)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="ACTIVE">Operational / Active</option>
              <option value="MAINTENANCE">Under Maintenance</option>
              <option value="OFFLINE">Temporarily Offline</option>
              <option value="PLANNED">Planned / Under Construction</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Access Type</label>
            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value as AccessType)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="PUBLIC">Public Access (24/7)</option>
              <option value="CUSTOMERS_ONLY">Customers / Shoppers Only</option>
              <option value="HOTEL">Hotel Guests Only</option>
              <option value="RESIDENTIAL">Residential / Private</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Pricing Info</label>
            <input
              type="text"
              value={pricingInfo}
              onChange={(e) => setPricingInfo(e.target.value)}
              placeholder="e.g., 280 RWF / kWh or Free for customers"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isFreeCheckbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="isFreeCheckbox" className="font-semibold text-slate-700 cursor-pointer">
              100% Free Charging Station
            </label>
          </div>
        </div>
      </div>

      {/* 3. Multi-Plug Connectors */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <ConnectorBuilder connectors={connectors} onChange={setConnectors} />
      </div>

      {/* 4. Amenities & Notes */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-xs">
        <div>
          <label className="mb-2 block font-semibold text-slate-700">
            Available Amenities On-Site
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {AMENITY_OPTIONS.map((am) => {
              const isChecked = amenities.includes(am.id);
              return (
                <button
                  type="button"
                  key={am.id}
                  onClick={() => toggleAmenity(am.id)}
                  className={`rounded-xl p-2.5 text-left border transition-all ${
                    isChecked
                      ? 'border-brand-500 bg-brand-50 text-brand-900 font-semibold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {am.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-700">
            Notes / Access Instructions (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Located near main gate, security operates the barrier..."
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isEditing ? 'Save Changes' : 'Publish Charging Station'}</span>
        </button>
      </div>
    </form>
  );
}
