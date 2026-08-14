-- ====================================================================
-- EVCHARGERS PLATFORM: POSTGRESQL + POSTGIS DATABASE SCHEMA
-- Compatible with Supabase (Free Tier)
-- ====================================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Stations Table
CREATE TABLE IF NOT EXISTS public.stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Kigali',
    country VARCHAR(100) DEFAULT 'Rwanda',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    operator_name VARCHAR(100) NOT NULL DEFAULT 'Independent',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'MAINTENANCE', 'OFFLINE', 'PLANNED'
    pricing_info TEXT DEFAULT 'Standard rate',
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    access_type VARCHAR(50) NOT NULL DEFAULT 'PUBLIC', -- 'PUBLIC', 'CUSTOMERS_ONLY', 'RESIDENTIAL', 'HOTEL'
    amenities TEXT[] DEFAULT '{}',
    notes TEXT,
    user_id UUID,
    user_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Connectors Table (Plugs / Sockets per station)
CREATE TABLE IF NOT EXISTS public.connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
    connector_type VARCHAR(50) NOT NULL, -- 'GB_T', 'CCS_2', 'TYPE_2', 'CHADEMO', 'NACS', 'TYPE_1'
    power_kw NUMERIC(6, 2) NOT NULL,     -- e.g. 22.00, 50.00, 120.00, 150.00, 250.00, 350.00
    quantity INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'OCCUPIED', 'FAULTED', 'UNKNOWN'
    current_type VARCHAR(10) NOT NULL DEFAULT 'DC'   -- 'AC', 'DC'
);

-- 4. Create Community Reports Table
CREATE TABLE IF NOT EXISTS public.station_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Spatial & Ownership Indexes
CREATE INDEX IF NOT EXISTS idx_stations_location ON public.stations USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_stations_status ON public.stations(status);
CREATE INDEX IF NOT EXISTS idx_stations_user_email ON public.stations(user_email);
CREATE INDEX IF NOT EXISTS idx_connectors_station_id ON public.connectors(station_id);

-- 6. Stored Function: Get Stations inside Map Viewport Bounding Box
CREATE OR REPLACE FUNCTION public.get_stations_in_bounds(
    min_lng DOUBLE PRECISION,
    min_lat DOUBLE PRECISION,
    max_lng DOUBLE PRECISION,
    max_lat DOUBLE PRECISION
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'address', s.address,
                'city', s.city,
                'country', s.country,
                'latitude', s.latitude,
                'longitude', s.longitude,
                'operator_name', s.operator_name,
                'status', s.status,
                'pricing_info', s.pricing_info,
                'is_free', s.is_free,
                'access_type', s.access_type,
                'amenities', s.amenities,
                'notes', s.notes,
                'user_id', s.user_id,
                'user_email', s.user_email,
                'created_at', s.created_at,
                'updated_at', s.updated_at,
                'connectors', COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', c.id,
                                'station_id', c.station_id,
                                'connector_type', c.connector_type,
                                'power_kw', c.power_kw,
                                'quantity', c.quantity,
                                'status', c.status,
                                'current_type', c.current_type
                            )
                        )
                        FROM public.connectors c
                        WHERE c.station_id = s.id
                    ),
                    '[]'::jsonb
                )
            )
        )
        FROM public.stations s
        WHERE ST_Contains(
            ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326),
            s.location::geometry
        )
    );
END;
$$;
