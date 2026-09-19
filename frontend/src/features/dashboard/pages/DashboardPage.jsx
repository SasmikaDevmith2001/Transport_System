import { useAuth } from '../../../contexts/AuthContext';
import { useTripsList } from '../../trips/hooks/useTrips';
import { useCustomersList } from '../../customers/hooks/useCustomers';
import { useDriversList } from '../../drivers/hooks/useDrivers';

/* ---- Palette per stat accent (transport blue theme) ---- */
const ACCENTS = {
  blue: { ring: 'ring-blue-100', chip: 'bg-blue-50 text-blue-600', bar: 'bg-blue-600', text: 'text-blue-600' },
  green: { ring: 'ring-emerald-100', chip: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-600' },
  sky: { ring: 'ring-sky-100', chip: 'bg-sky-50 text-sky-600', bar: 'bg-sky-500', text: 'text-sky-600' },
  amber: { ring: 'ring-amber-100', chip: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500', text: 'text-amber-600' },
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  assigned: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

function StatCard({ label, value, subtitle, icon, accent, loading }) {
  const a = ACCENTS[accent] || ACCENTS.blue;
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${a.ring} transition hover:shadow-md dark:bg-slate-800 dark:ring-slate-700`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-gray-800 dark:text-slate-100">
            {loading ? <span className="loading loading-dots loading-sm text-gray-400" /> : value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{subtitle}</p>}
        </div>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${a.chip}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, progress, accent }) {
  const a = ACCENTS[accent] || ACCENTS.blue;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
        <div className={`h-full rounded-full ${a.bar} transition-all`} style={{ width: `${progress || 0}%` }} />
      </div>
    </div>
  );
}

function RecentActivityCard({ trips, loading }) {
  const recentTrips = (trips || []).slice(0, 5);
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">Recent Trips</h3>
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Last 5</span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : recentTrips.length === 0 ? (
        <div className="grid place-items-center py-8 text-center text-gray-400 dark:text-slate-500">
          <TruckIcon className="mb-2 h-8 w-8 opacity-40" />
          <p className="text-sm">No trips yet</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {recentTrips.map((trip) => (
            <li key={trip.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                  <TruckIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                    {trip.origin} → {trip.destination}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {trip.tripNumber} • {trip.scheduledDate}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                  STATUS_BADGE[trip.status] || 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {trip.status?.replace('_', ' ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch summary data
  const { data: tripsData, isLoading: tripsLoading } = useTripsList({ page: 1, pageSize: 5 });
  const { data: customersData, isLoading: customersLoading } = useCustomersList({ page: 1, pageSize: 1, status: 'active' });
  const { data: driversData, isLoading: driversLoading } = useDriversList({ page: 1, pageSize: 1, status: 'active' });
  const { data: pendingTripsData, isLoading: pendingLoading } = useTripsList({ page: 1, pageSize: 1, status: 'pending' });

  const totalTrips = tripsData?.meta?.total ?? 0;
  const totalCustomers = customersData?.meta?.total ?? 0;
  const totalDrivers = driversData?.meta?.total ?? 0;
  const pendingTrips = pendingTripsData?.meta?.total ?? 0;
  const trips = tripsData?.data || [];

  // Calculate trip distribution for the info card
  const assignedTrips = totalTrips > 0 ? Math.max(totalTrips - pendingTrips, 0) : 0;
  const assignedPct = totalTrips > 0 ? Math.round((assignedTrips / totalTrips) * 100) : 0;
  const pendingPct = totalTrips > 0 ? Math.round((pendingTrips / totalTrips) * 100) : 0;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header banner */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-24 h-24 w-24 rounded-full bg-sky-300/20 blur-xl" />
        <div className="relative z-10 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <TruckIcon className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">
              {greeting}, {user?.firstName || 'Admin'}
            </h1>
            <p className="mt-0.5 text-sm text-white/80">
              Here's what's happening with your transport operations today.
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Trips" value={totalTrips} subtitle="All time" accent="blue" loading={tripsLoading} icon={<TruckIcon className="h-6 w-6" />} />
        <StatCard label="Active Drivers" value={totalDrivers} subtitle="Currently active" accent="green" loading={driversLoading} icon={<BadgeIcon className="h-6 w-6" />} />
        <StatCard label="Active Customers" value={totalCustomers} subtitle="Registered clients" accent="sky" loading={customersLoading} icon={<BuildingIcon className="h-6 w-6" />} />
        <StatCard label="Pending Trips" value={pendingTrips} subtitle="Awaiting assignment" accent="amber" loading={pendingLoading} icon={<ClockIcon className="h-6 w-6" />} />
      </div>

      {/* Bottom section */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentActivityCard trips={trips} loading={tripsLoading} />
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700">
            <h3 className="mb-4 text-base font-bold text-gray-800 dark:text-slate-100">Trip Overview</h3>
            <div className="space-y-4">
              <ProgressRow label="Assigned / In Progress" value={assignedTrips} progress={assignedPct} accent="blue" />
              <ProgressRow label="Pending Assignment" value={pendingTrips} progress={pendingPct} accent="amber" />
              <ProgressRow label="Total Drivers" value={totalDrivers} progress={totalDrivers > 0 ? 100 : 0} accent="green" />
              <ProgressRow label="Total Customers" value={totalCustomers} progress={totalCustomers > 0 ? 100 : 0} accent="sky" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Inline icons (no extra deps) ---- */
function TruckIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8 0h2m-6 0h4m4 0h1a1 1 0 001-1v-3.28a1 1 0 00-.684-.948l-2.658-.886a1 1 0 01-.632-.632l-.895-2.684A1 1 0 0016.28 8H13" />
    </svg>
  );
}

function BadgeIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function BuildingIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
