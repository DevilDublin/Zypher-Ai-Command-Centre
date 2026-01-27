import { Outlet, useLocation } from "react-router-dom";
import NeonNav from "./components/NeonNav";

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className={isHome ? "public-root lock-scroll" : "public-root"}>
      <NeonNav />
      <Outlet />
    </div>
  );
}
