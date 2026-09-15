import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Navigation, Phone, Mail, Globe, Building2, Shield, AlertTriangle, Filter, Search, ExternalLink, Locate } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useChatContext } from '../context/ChatContext.jsx';
import { api } from '../services/api.js';
import { getUserLocation, openDirections, INDIA_CENTER, INDIA_ZOOM } from '../services/geoService.js';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PARTNER_COLORS = {
  SCA: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200', hex: '#f97316' },
  PSB: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200', hex: '#3b82f6' },
  RRB: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200', hex: '#22c55e' },
  NBFC_MFI: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-200', hex: '#a855f7' }
};

const HEALTH_COLORS = {
  GREEN: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: Shield },
  AMBER: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Shield },
  ORANGE: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle },
  RED: { bg: 'bg-rose-100', text: 'text-rose-800', icon: AlertTriangle }
};

const createColoredIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:rotate(-45deg);position:relative;"><div style="width:10px;height:10px;background:white;border-radius:50%;position:absolute;top:6px;left:6px;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

const userIcon = new L.DivIcon({
  className: 'user-marker',
  html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;border:4px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

/** Recenter map when center changes */
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || 10);
  }, [center, zoom]);
  return null;
};

export const PartnerLocator = () => {
  const { t } = useChatContext();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [mapCenter, setMapCenter] = useState([INDIA_CENTER.lat, INDIA_CENTER.lng]);
  const [mapZoom, setMapZoom] = useState(INDIA_ZOOM);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [schemeFilter, setSchemeFilter] = useState('');
  const [maxDistance, setMaxDistance] = useState(500);
  const [searchQuery, setSearchQuery] = useState('');

  // Load all partners initially
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      if (userLoc) {
        const data = await api.getNearbyPartners({
          lat: userLoc.lat,
          lng: userLoc.lng,
          maxDistanceKm: maxDistance,
          type: typeFilter || undefined,
          schemeId: schemeFilter || undefined
        });
        setPartners(data.partners || []);
      } else {
        const data = await api.getAllPartners({
          type: typeFilter || undefined,
          schemeId: schemeFilter || undefined
        });
        setPartners(data.partners || []);
      }
    } catch (err) {
      console.error('Partner load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [typeFilter, schemeFilter, maxDistance, userLoc]);

  const handleLocateMe = async () => {
    setLocatingUser(true);
    try {
      const loc = await getUserLocation();
      setUserLoc(loc);
      setMapCenter([loc.lat, loc.lng]);
      setMapZoom(10);
    } catch (err) {
      alert(t('partners.locationError', 'Unable to get your location. Please allow location access or enter your city.'));
    } finally {
      setLocatingUser(false);
    }
  };

  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;
    const q = searchQuery.toLowerCase();
    return partners.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.state?.toLowerCase().includes(q) ||
      p.district?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  }, [partners, searchQuery]);

  const handlePartnerClick = (partner) => {
    setSelectedPartner(partner);
    const coords = partner.location?.coordinates || partner.coordinates;
    if (coords) {
      setMapCenter([coords[1], coords[0]]);
      setMapZoom(13);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="truncate">{t('partners.title', 'Channel Partner Locator')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 sm:ml-12">
            {t('partners.subtitle', 'Find the nearest SCA, Bank, or NBFC-MFI that handles your eligible scheme')}
          </p>
        </div>

        <button
          onClick={handleLocateMe}
          disabled={locatingUser}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 w-full sm:w-auto"
        >
          <Locate className={`w-4 h-4 ${locatingUser ? 'animate-pulse' : ''}`} />
          <span>{locatingUser ? t('partners.locating', 'Locating...') : t('partners.detectLocation', 'Detect My Location')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('partners.searchPlaceholder', 'Search by name, state, or city...')}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none">
          <option value="">{t('partners.allTypes', 'All Partner Types')}</option>
          <option value="SCA">{t('partners.scaOption', '🟠 SCA (State Channelizing Agency)')}</option>
          <option value="PSB">{t('partners.psbOption', '🔵 PSB (Public Sector Bank)')}</option>
          <option value="RRB">{t('partners.rrbOption', '🟢 RRB (Regional Rural Bank)')}</option>
          <option value="NBFC_MFI">{t('partners.nbfcOption', '🟣 NBFC-MFI')}</option>
        </select>

        {userLoc && (
          <div className="flex items-center space-x-2">
            <label className="text-[10px] font-bold text-slate-500">{t('partners.maxDistance', 'Max Distance')}:</label>
            <select value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200">
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={200}>200 km</option>
              <option value={500}>500 km</option>
              <option value={1000}>1000 km</option>
            </select>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center space-x-3 ml-auto text-[10px] font-semibold">
          <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span><span>{t('partners.scaShort', 'SCA')}</span></span>
          <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span><span>{t('partners.psbShort', 'PSB')}</span></span>
          <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span><span>{t('partners.rrbShort', 'RRB')}</span></span>
          <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span><span>{t('partners.nbfcShort', 'NBFC')}</span></span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-slate-200 shadow-lg h-[320px] sm:h-[420px] lg:h-[520px]">
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <MapRecenter center={mapCenter} zoom={mapZoom} />

            {/* User location marker */}
            {userLoc && (
              <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
                <Popup><strong>{t('partners.yourLocation', 'Your Location')}</strong></Popup>
              </Marker>
            )}

            {/* Partner markers */}
            {filteredPartners.map((p) => {
              const coords = p.location?.coordinates;
              if (!coords) return null;
              const color = PARTNER_COLORS[p.type]?.hex || '#6b7280';
              return (
                <Marker key={p.partnerId} position={[coords[1], coords[0]]} icon={createColoredIcon(color)}>
                  <Popup>
                    <div className="text-xs space-y-1 min-w-[200px]">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-slate-500">{p.address}</p>
                      {p.contactPhone && <p className="text-brand-600">📞 {p.contactPhone}</p>}
                      {p.distanceKm != null && <p className="font-semibold text-indigo-600">📍 {p.distanceKm} km away</p>}
                      <button
                        onClick={() => openDirections(coords[1], coords[0], userLoc?.lat, userLoc?.lng)}
                        className="mt-1 px-3 py-1 bg-brand-600 text-white rounded-lg text-[10px] font-bold hover:bg-brand-700"
                      >
                        Get Directions →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Partner Cards List */}
        <div className="lg:col-span-2 space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">{t('common.loading', 'Loading...')}</div>
          ) : filteredPartners.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              {t('partners.noResults', 'No partners found. Try adjusting filters or detect your location.')}
            </div>
          ) : (
            filteredPartners.map((p) => {
              const colors = PARTNER_COLORS[p.type] || PARTNER_COLORS.SCA;
              const health = HEALTH_COLORS[p.healthBadge?.level] || HEALTH_COLORS.AMBER;
              const HealthIcon = health.icon;
              const isSelected = selectedPartner?.partnerId === p.partnerId;
              const coords = p.location?.coordinates;

              return (
                <div
                  key={p.partnerId}
                  onClick={() => handlePartnerClick(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                    ? `${colors.light} ${colors.border} ring-2 ring-offset-1 shadow-md`
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${colors.bg}`}>
                          {p.type?.replace('_', '-')}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${health.bg} ${health.text}`}>
                          <HealthIcon className="w-2.5 h-2.5 inline mr-0.5" />
                          {p.healthBadge?.label || 'N/A'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{p.address}</p>
                    </div>
                    {p.distanceKm != null && (
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-indigo-600">{p.distanceKm}</p>
                        <p className="text-[9px] text-slate-400 font-bold">km</p>
                      </div>
                    )}
                  </div>

                  {/* Contact & Actions */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {p.contactPhone && (
                      <a href={`tel:${p.contactPhone}`} className="flex items-center space-x-1 text-[10px] text-brand-600 font-semibold hover:underline">
                        <Phone className="w-3 h-3" /><span>{p.contactPhone}</span>
                      </a>
                    )}
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-[10px] text-brand-600 font-semibold hover:underline">
                        <Globe className="w-3 h-3" /><span>{t('partners.website', 'Website')}</span>
                      </a>
                    )}
                    {coords && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openDirections(coords[1], coords[0], userLoc?.lat, userLoc?.lng); }}
                        className="flex items-center space-x-1 text-[10px] text-indigo-600 font-semibold hover:underline ml-auto"
                      >
                        <Navigation className="w-3 h-3" /><span>{t('partners.directions', 'Directions')}</span>
                      </button>
                    )}
                  </div>

                  {/* Schemes handled */}
                  {p.schemesHandled?.length > 0 && isSelected && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('partners.schemesHandled', 'Schemes Handled')}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.schemesHandled.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-semibold text-slate-600">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
