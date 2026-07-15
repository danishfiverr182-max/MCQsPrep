/**
 * src/public/layouts/PublicLayout.jsx  (updated Prompt 65)
 *
 * Root layout for every public-facing page.
 * Now wraps children with both:
 *   - PublicCategoriesProvider  (categories for Navbar / Footer quick links)
 *   - PublicSettingsProvider    (contact info for Footer / popups)
 *
 * Note: the actual Navbar + main content + PremiumPopup modals live in
 * UserLayout (used as the route element). PublicLayout is the outer wrapper
 * that supplies shared context to everything inside it.
 */

import { Outlet } from "react-router-dom";
import { PublicCategoriesProvider } from "../context/PublicCategoriesContext";
import { PublicSettingsProvider }   from "../context/PublicSettingsContext";

export default function PublicLayout() {
  return (
    <PublicCategoriesProvider>
      <PublicSettingsProvider>
        <Outlet />
      </PublicSettingsProvider>
    </PublicCategoriesProvider>
  );
}
