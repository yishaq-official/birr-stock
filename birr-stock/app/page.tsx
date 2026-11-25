import Link from "next/link";

export default function DashboardPage() {
  const statCards = [
    { label: "Active SKUs", value: "2,410", change: "+12 this week", status: "neutral" },
    { label: "On-Hand Stock", value: "84,390", change: "98.4% accurate", status: "success" },
    { label: "Reserved for Orders", value: "1,140", change: "18 active waves", status: "info" },
    { label: "Available-To-Promise", value: "83,250", change: "Real-time sync", status: "success" },
    { label: "Pending PO Receiving", value: "4 Shipments", change: "Dock 1 & 2", status: "warning" },
    { label: "Pending Returns (RMA)", value: "19 Units", change: "Awaiting grading", status: "warning" },
  ];

  const quickActions = [
    {
      title: "Inbound Dock Receiving",
      description: "Scan incoming PO packing slips, verify SKUs, and flag damaged shipments.",
      href: "/receiving",
      badge: "Inbound",
      color: "border-blue-800/40 hover:border-blue-600 bg-blue-950/20",
    },
    {
      title: "Fulfillment & Wave Picking",
      description: "Batch pick waves with S-shape aisle navigation and barcode confirmation.",
      href: "/waves",
      badge: "Warehouse Floor",
      color: "border-indigo-800/40 hover:border-indigo-600 bg-indigo-950/20",
    },
    {
      title: "Packing Station Verification",
      description: "100% barcode validation before cartonization and zero-click ZPL label printing.",
      href: "/pack",
      badge: "Packing Desk",
      color: "border-emerald-800/40 hover:border-emerald-600 bg-emerald-950/20",
    },
    {
      title: "Reverse Logistics & RMA",
      description: "3-tier item inspection grading (Grade A restock, Grade B outlet, Grade C scrap).",
      href: "/returns",
      badge: "Returns",
      color: "border-purple-800/40 hover:border-purple-600 bg-purple-950/20",
    },
    {
      title: "Inventory Ledger & Bins",
      description: "Double-entry transaction audit log and 6-level physical warehouse bin mapping.",
      href: "/inventory",
      badge: "Audit & Ledger",
      color: "border-gray-800 hover:border-gray-600 bg-gray-900/30",
    },
    {
      title: "Channel Sync & Buffers",
      description: "Manage safety buffers, debounced sync workers, and Shopify/Amazon connectors.",
      href: "/channels",
      badge: "Integrations",
      color: "border-amber-800/40 hover:border-amber-600 bg-amber-950/20",
    },
  ];

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Operations Control Center</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time warehouse activity, immutable transaction ledger, and omnichannel fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-gray-300 font-mono">Backend: http://localhost:4000</span>
          </div>
          <Link
            href="/pack"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            Open Pack Station
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between"
          >
            <span className="text-xs font-medium text-gray-400">{card.label}</span>
            <div className="my-2">
              <span className="text-2xl font-bold text-white tracking-tight">{card.value}</span>
            </div>
            <span className="text-xs text-gray-400">{card.change}</span>
          </div>
        ))}
      </div>

      {/* Operational Workflows Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Warehouse & Fulfillment Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${action.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700/50">
                    {action.badge}
                  </span>
                  <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{action.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/40 text-xs text-gray-500 flex items-center justify-between">
                <span>Launch workflow</span>
                <span className="font-mono text-[10px]">SCAN ENABLED</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
