import Link from "next/link";

export default function Header() {
  const navlinks = [
    { name: "Overview", href: "/" },
    { name: "Inventory", href: "/inventory" },
    { name: "Receiving (PO)", href: "/receiving" },
    { name: "Fulfillment & Waves", href: "/waves" },
    { name: "Pack Station", href: "/pack" },
    { name: "Returns (RMA)", href: "/returns" },
  ];

  return (
    <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          BirrStock IMS
        </span>
        <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-semibold border border-blue-800/50">
          Enterprise
        </span>
      </div>
      <nav className="flex items-center gap-6">
        {navlinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-gray-400">Ledger Live</span>
      </div>
    </header>
  );
}
