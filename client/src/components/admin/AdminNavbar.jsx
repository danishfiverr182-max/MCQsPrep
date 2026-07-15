import { NavLink, useSearchParams } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";

export default function AdminNavbar() {
  const { categories } = useCategories();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");

  function linkClass(isActive) {
    return `text-sm font-medium px-3 py-2 rounded-lg transition whitespace-nowrap ${
      isActive
        ? "bg-accent text-white font-semibold"
        : "text-txt-secondary hover:text-txt-primary hover:bg-bg"
    }`;
  }

  return (
    <nav className="bg-surface border-b border-border px-6 overflow-x-auto">
      <div className="flex items-center gap-1 h-12 min-w-max">
        {/* Home link active when no category param */}
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) =>
            linkClass(isActive && !activeCategory)
          }
        >
          Home
        </NavLink>

        {/* One link per category */}
        {categories.map((cat) => (
          <NavLink
            key={cat._id}
            to={`/admin/dashboard?category=${cat.slug}`}
            className={() => linkClass(activeCategory === cat.slug)}
          >
            {cat.name}
          </NavLink>
        ))}

        {/* Divider */}
        <span className="mx-2 text-txt-primary select-none">|</span>

        {/* Manage Users */}
        <NavLink
          to="/admin/users"
          className={({ isActive }) => linkClass(isActive)}
        >
          Manage Users
        </NavLink>
      </div>
    </nav>
  );
}
