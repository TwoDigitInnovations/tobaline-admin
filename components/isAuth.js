import { useEffect } from "react";
import { useRouter } from "next/router";

const isAuth = (Component) => {
  return function IsAuth(props) {
    const router = useRouter();
    let auth = false;

    if (typeof window !== "undefined") {
      const user = localStorage.getItem("userDetail");
      const token = localStorage.getItem("token");

      if (user && token) {
        const u = JSON.parse(user);
        auth = u?.role === "Admin";
      }
    }

    useEffect(() => {
      if (!auth) {
        localStorage.clear();
        router.replace("/login");
      }
    }, []);

    return <Component {...props} />;
  };
};

export default isAuth;
