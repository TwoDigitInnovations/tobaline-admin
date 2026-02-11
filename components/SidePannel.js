import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { MdDashboard } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { userContext } from "../pages/_app";
import { BiSolidCategory } from "react-icons/bi";
import { AiFillProduct } from "react-icons/ai";
import { FaCircleQuestion } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import { PiSignOutFill } from "react-icons/pi";
import Swal from "sweetalert2";
import { MdRateReview } from "react-icons/md";
import { User } from "lucide-react";
import { GiClothes } from "react-icons/gi";

const SidePannel = ({ setOpenTab, openTab }) => {
  const [user, setUser] = useContext(userContext);
  const router = useRouter();

  const logOut = () => {
    setUser({});
    localStorage.removeItem("userDetail");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const menuItems = [
    {
      href: "/",
      title: "Dashboard",
      img: <MdDashboard className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/inventory",
      title: "Inventory",
      img: <AiFillProduct className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/queries",
      title: "Queries",
      img: <FaCircleQuestion className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/orders",
      title: "Orders",
      img: <FaShoppingBag className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/categories",
      title: "Categories",
      img: <BiSolidCategory className="text-3xl" />,
      access: ["ADMIN"],
    },{
      href: "/ClothType",
      title: "Cloth Type",
      img: <GiClothes className="text-3xl" />,
      access: ["ADMIN"],
    },


    // {
    //   href: "/settings",
    //   title: "Settings",
    //   img: <BiSolidCategory className="text-3xl" />,
    //   access: ["ADMIN"],
    // },
  ];



  return (
    <>
      <div className="xl:w-[280px] fixed top-0 left-0 z-20 md:w-[250px] sm:w-[200px] hidden sm:grid grid-rows-5 overflow-hidden">
        <div>
          <div className="bg-[#e5e5e5] py-5 overflow-y-scroll h-screen scrollbar-hide">
            <div
              className=" pt-5 pb-5 row-span-1 flex items-center justify-center cursor-pointer mx-5 rounded"
              onClick={() => router.push("/")}
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="w-[150px] h-auto  object-contain"
              />
            </div>

            <div className="flex flex-col justify-between row-span-4 w-full">
              <ul className="w-full flex flex-col text-left mt-5">
                {menuItems.map((item, i) =>
                  item?.access?.includes(user?.role) ? (
                    <Link
                      href={item.href}
                      key={i}
                      className={`flex items-center mx-5 px-8 cursor-pointer group  hover:text-white hover:bg-black m-1 ${
                        router.pathname === item.href
                          ? "bg-[#0f0f0f] text-white rounded-[8px]"
                          : "text-black"
                      }`}
                    >
                      <div className="py-3 font-semibold flex items-center gap-4">
                        {/* <div className="w-6">{item?.img}</div> */}
                        {item?.title}
                      </div>
                    </Link>
                  ) : null,
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full absolute top-0 left-0 z-40 sm:hidden flex flex-col h-screen max-h-screen overflow-hidden bg-[#e5e5e5] ${
          openTab ? "scale-x-100" : "scale-x-0"
        } transition-all duration-300 origin-left`}
      >
        <div className="row-span-1 w-full text-white relative">
          <ImCross
            className="absolute text-black top-4 right-4 z-40 text-2xl"
            onClick={() => setOpenTab(!openTab)}
          />
          <div className="flex flex-col gap-3 w-full p-3">
            <div className="p-1 rounded overflow-hidden">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-[152px] h-auto object-contain"
              />
            </div>
            <div className="flex ms-2 justify-between">
              <div className="flex">
                <div className="w-12 h-12 flex justify-center  items-center rounded-full overflow-hidden border-black border">
                  <User className="text-black" size={24}/>
                </div>
                <p className="mt-3 ms-3 text-lg text-black font-bold">
                  {user?.name}
                </p>
              </div>
              <div>
                {user?.token ? (
                  <div
                    className="flex gap-2 mt-3 items-center cursor-pointer"
                    onClick={() => {
                      Swal.fire({
                        text: "Are you sure you want to logout?",
                        showCancelButton: true,
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        confirmButtonColor: "#FEC200",
                        customClass: {
                          confirmButton: "px-12 rounded-xl",
                          title: "text-[20px] text-black",
                          actions: "swal2-actions-no-hover",
                          popup: "rounded-[15px] shadow-custom-green",
                        },
                        buttonsStyling: true,
                        reverseButtons: true,
                        width: "320px",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          logOut();
                        }
                      });
                    }}
                  >
                    <div className="text-black font-bold">Sign Out</div>
                    <div className="rounded-full">
                      <PiSignOutFill className="text-3xl text-black" />
                    </div>
                  </div>
                ) : (
                  <Link href="/login">
                    <div className="p-3 mt-3 items-center font-bold text-black">
                      LogIn
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-start row-span-2 h-full w-full">
          <ul className="w-full h-full flex flex-col text-left justify-start items-center border-t-2 border-black">
            {menuItems.map((item, i) =>
              item?.access?.includes(user?.role) ? (
                <li
                  key={i}
                  className="w-full flex items-center text-black cursor-pointer group hover:bg-[#127300] border-b-2 border-black"
                >
                  <div
                    className="py-2 pl-6 font-semibold flex items-center gap-4"
                    onClick={() => setOpenTab(!openTab)}
                  >
                    <div className="w-6">{item?.img}</div>
                    <Link href={item.href}>{item?.title}</Link>
                  </div>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SidePannel;
