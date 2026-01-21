import { useContext, useState } from "react";
import { useRouter } from "next/router";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShoppingCart,
  ArrowRight,
  SquareAsterisk,
} from "lucide-react";
import { Api } from "../services/service";
import { userContext } from "./_app";
import { IPInfoContext } from "ip-info-react";

export default function Login(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const userInfo = useContext(IPInfoContext);

  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");

  const [userDetail, setUserDetail] = useState({
    username: "",
    password: "",
  });

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    setSubmitted(true);
    if (!userDetail.username || !userDetail.password) {
      return props.toaster({ type: "error", message: "Missing credentials" });
    }

    try {
      setLoading(true);
      props.loader(true);

      const res = await Api(
        "post",
        "loginwithOtp",
        { ...userDetail, ipConfing: userInfo, action: "sendOtpForLogin" },
        router,
      );

      props.loader(false);
      setLoading(false);

      if (res?.status) {
        setToken(res.data.token);
        props.toaster({ type: "success", message: res.data.message });
      } else {
        props.toaster({ type: "error", message: res.message });
      }
    } catch (err) {
      props.loader(false);
      setLoading(false);
      props.toaster({ type: "error", message: "Something went wrong" });
    }
  };

  /* ================= VERIFY OTP ================= */
  const submit = async () => {
    setSubmitted(true);
    if (!otp) {
      return props.toaster({ type: "error", message: "OTP is required" });
    }

    try {
      setLoading(true);
      props.loader(true);

      const res = await Api(
        "post",
        "verifyOTPForLogin",
        { token, otp, ipConfing: userInfo, action: "verifyOTPForLogin" },
        router,
      );

      props.loader(false);
      setLoading(false);

      if (res?.status) {
        localStorage.setItem("userDetail", JSON.stringify(res.data));
        localStorage.setItem("token", res.data.token);
        setUser(res.data);

        router.push(res.data.type === "ADMIN" ? "/" : "/inventory");
      } else {
        props.toaster({ type: "error", message: res.message });
      }
    } catch (err) {
      props.loader(false);
      setLoading(false);
      props.toaster({ type: "error", message: "Something went wrong" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-black p-3 rounded-xl">
            <ShoppingCart className="text-white w-7 h-7" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-black">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Login to continue
        </p>

        {/* ================= FORM ================= */}
        {!token ? (
          <div className="space-y-5">
            {/* Username */}
            <InputField
              label="Username"
              placeholder="Enter your username"
              icon={<Mail size={18} />}
              value={userDetail.username}
              error={submitted && !userDetail.username}
              onChange={(e) =>
                setUserDetail({ ...userDetail, username: e.target.value })
              }
            />

            {/* Password */}
            <InputField
              label="Password"
              type={showPass ? "text" : "password"}
              icon={<Lock size={18} />}
              placeholder="Enter your Password"
              value={userDetail.password}
              error={submitted && !userDetail.password}
              rightIcon={
                <button onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              onChange={(e) =>
                setUserDetail({ ...userDetail, password: e.target.value })
              }
            />

            <PrimaryButton
              onClick={sendOtp}
              loading={loading}
              text="Send OTP"
            />
          </div>
        ) : (
          <div className="space-y-5">
            <InputField
              label="OTP"
              placeholder="Enter your OTP"
              icon={<SquareAsterisk size={18} />}
              value={otp}
              error={submitted && !otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <PrimaryButton
              onClick={submit}
              loading={loading}
              text="Verify OTP"
            />
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2025. All rights reserved.
        </p>
      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const InputField = ({
  label,
  icon,
  rightIcon,
  type = "text",
  value,
  placeholder,
  onChange,
  error,
}) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <span className="absolute left-3 top-3 text-gray-400">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-10 py-3 rounded-xl border text-black focus:outline-none ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        }`}
        placeholder={placeholder}
      />
      <span className="absolute right-3 top-3 text-gray-400">{rightIcon}</span>
    </div>
  </div>
);

const PrimaryButton = ({ onClick, loading, text }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition"
  >
    {loading ? "Please wait..." : text}
    {!loading && <ArrowRight size={18} />}
  </button>
);
