/**
 * TopBar (public/components)
 *
 * The top bar is part of the unified Navbar component
 * (src/components/user/Navbar.jsx). It is not split into a separate
 * file because the sticky header needs both bars to share a single
 * <header> element for correct shadow/border rendering.
 *
 * This file re-exports Navbar so any prompt that imports from
 * "../../public/components/TopBar" still works.
 */
export { default } from "../../components/user/Navbar";
