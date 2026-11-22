import Link from "next/link";
function Header() {
const navlinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

return (
  <div>
    {
navlinks.map((link) => (
      <Link key={link.name} href={link.href}>
        {link.name}
      </Link>
    ))}
  </div>
);
}