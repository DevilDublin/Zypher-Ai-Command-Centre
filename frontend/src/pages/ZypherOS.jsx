import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import DeveloperLogin from "./DeveloperLogin";
import "./ZypherOS.css";

export default function ZypherOS() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const showLogin = pathname === "/developer";

  useEffect(() => {
    if (pathname !== "/developer") return;

    const intent = sessionStorage.getItem("zy_dev_intent");
    if (intent !== "1") {
      nav("/", { replace: true });
      return;
    }

    // consume intent so refresh bounces back next time
    sessionStorage.removeItem("zy_dev_intent");
  }, [pathname, nav]);


  
return (
  <>


    <div className="zypher-os">
      <div className="os-noise" />
      <div className="os-vignette" />

      <div className="os-core">
        <div className="os-logo zypher-title">ZYPHER</div>

        <div className="os-actions">
          <button className="os-btn client" disabled>
            <span data-text="CLIENT ACCESS">CLIENT ACCESS</span>
          </button>

          <button
            className="os-btn dev"
            onClick={() => { sessionStorage.setItem("zy_dev_intent","1"); nav("/developer"); }}
          >
            <span data-text="DEVELOPER TERMINAL">DEVELOPER TERMINAL</span>
          </button>
        </div>
      </div>

      {showLogin && (
        <div className="os-overlay">
          <DeveloperLogin />
        </div>
      )}
    </div>
  </>
);

}