"use client";

import React, { useMemo, useEffect, useContext } from "react";
import { useState } from "react";
import Table from "../components/table";
import isAuth from "../components/isAuth";
import { Api } from "../services/service";
import { useRouter } from "next/router";
import moment from "moment";
import { Drawer } from "@mui/material";
import {
  IoCloseCircleOutline,
} from "react-icons/io5";
import { userContext } from "./_app";

import {
  Search,
  Filter,
  Calendar,
  XCircle,
} from "lucide-react";

function Orders(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [userRquestList, setUserRquestList] = useState([]);
  const [openCart, setOpenCart] = useState(false);
  const [cartData, setCartData] = useState({});
  const [orderId, setOrderId] = useState("");
  const [selctDate, setSelctDate] = useState("");
  const [pickupDate, setPickupdate] = useState("");
  const [isDateSelectedManually, setIsDateSelectedManually] = useState(false);
  const [selectedPikcupOption, setSelectedpickupOption] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getOrderBySeller(selctDate, selectedPikcupOption, page, orderId);
  };

  const BRAND_COLOR = "#127300";

  const closeDrawer = async () => {
    setOpenCart(false);
    setCartData({});
  };

  useEffect(() => {
    const dateToSend = isDateSelectedManually ? selctDate : null;
    getOrderBySeller(dateToSend, currentPage, orderId);
  }, [selctDate, currentPage, orderId]);

  const resetFilters = () => {
    setSelctDate("");
    setSelectedpickupOption("All");
    setCurrentPage(1);
    setOrderId("");
    setPickupdate("");
  };

  const getOrderBySeller = async (
    selctDate,
    page = 1,
    limit = 10
  ) => {
    const data = {};

    if (selctDate) {
      data.curentDate = moment(new Date(selctDate)).format();
    }

    if (orderId) {
      data.orderId = orderId;
    }

    props.loader(true);

    Api(
      "post",
      `getOrderBySeller?page=${page}&limit=${limit}`,
      data,
      router
    ).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.data);
        setUserRquestList(res?.data);
        setPagination(res?.pagination);
        setCurrentPage(res?.pagination?.currentPage);
        console.log(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  function convertISODateToFormattedString(isoDateString) {
    const date = new Date(isoDateString);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${day} ${monthNames[monthIndex]} ${year}`;
  }

  function name({ value }) {
    return (
      <div>
        <p className="text-black text-[15px] font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function Status({ value }) {
    const statusColors = {
      Pending: "text-yellow-500",
      Completed: "text-green-600",
      Return: "text-blue-500",
      Cancel: "text-red-500",
      "Return Requested": "text-purple-500",
    };

    const textColor = statusColors[value] || "text-gray-500"; // fallback color

    return (
      <div>
        <p className={`${textColor} text-[15px] font-semibold text-center`}>
          {value}
        </p>
      </div>
    );
  }

  function date({ row }) {
    return (
      <div>
        <p className="text-black text-base font-normal text-center">
          {convertISODateToFormattedString(row.original.createdAt)}
        </p>
      </div>
    );
  }

  function mobile({ value }) {
    return (
      <div>
        <p className="text-black text-[15px] font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  const info = ({ value, row }) => {
    return (
      <div className=" p-4  flex items-center  justify-center">
        <button
          className="h-[38px] w-[93px] bg-[#00000020] text-black text-[15px] cursor-pointer font-normal rounded-[8px]"
          onClick={() => {
            setOpenCart(true);
            setCartData(row.original);
            console.log(row.original.note);
            console.log("", row.original);
          }}
        >
          See
        </button>
      </div>
    );
  };

  const OrderID = ({ row }) => {
    return (
      <div>
        <p className="text-black text-[15px] font-normal text-center">
          {row.original.orderId}
        </p>
      </div>
    );
  };

  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: "Date",
        Cell: date,
      },
      {
        Header: "Order #",
        Cell: OrderID,
      },

      {
        Header: "NAME",
        accessor: "user.name",
        Cell: name,
      },
      {
        Header: "Mobile",
        accessor: "user.phone",
        Cell: mobile,
      },

      {
        Header: "Order Status",
        accessor: "status",
        Cell: Status,
      },
      {
        Header: "Details",
        Cell: info,
      },
    ],
    []
  );

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date))) return "";
    return new Date(date).toISOString().split("T")[0];
  };


  return (
    <section className=" w-full h-full bg-transparent py-4 ">
      <div className="flex justify-between items-center px-4">
        <p className="text-black font-bold  md:text-[32px] text-2xl">Orders</p>
      </div>
      <section
        className="px-5 pt-5 md:pb-32 bg-white h-full rounded-[12px] 
            overflow-y-scroll   scrollbar-hide overflow-scroll pb-28 md:mt-5 mt-5"
      >
        <div className="bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full">
          <div className="flex items-center mb-4">
            <Filter
              className="h-5 w-5 text-orange-500 mr-2"
              style={{ color: BRAND_COLOR }}
            />
            <h3 className="font-semibold text-gray-800">Filter Orders</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-[16px] font-medium text-gray-700 mb-1">
                Order ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Search by order ID"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:border-opacity-50 text-black"
                  style={{
                    borderColor: orderId ? BRAND_COLOR : undefined,
                    "--tw-ring-color": BRAND_COLOR,
                  }}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#127300]" />
                {orderId && (
                  <button
                    onClick={() => setOrderId("")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-4 w-4 text-[#127300]" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:border-opacity-50 text-black"
                  style={{
                    "--tw-ring-color": BRAND_COLOR,
                  }}
                  type="date"
                  value={formatDate(selctDate)}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    setSelctDate(selected);
                    setIsDateSelectedManually(true);
                  }}
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#127300]" />
              </div>
            </div>

            <div className="flex justify-end mt-6 h-12">
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 border cursor-pointer border-gray-300 rounded-md text-white"
                style={{
                  backgroundColor: BRAND_COLOR,
                  "--tw-ring-color": BRAND_COLOR,
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <Drawer
          className="custom-drawer"
          open={openCart}
          onClose={closeDrawer}
          anchor={"right"}
        >
          <div className="md:w-[43vw] w-[380px] relative">
            <div className="w-full h-full overflow-y-scroll scrollbar-hide overflow-scroll md:pb-44 pb-32">
              <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <h2 className="text-[#127300] text-xl font-semibold">
                    Order Details
                  </h2>
                </div>
                <IoCloseCircleOutline
                  className="text-[#127300] w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={closeDrawer}
                />
              </div>

              {cartData?.status === "Cancel" && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">
                        Order has been cancelled
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-5 pt-4">
                <h3 className="text-gray-800 font-medium mb-3">Order Items</h3>
                {cartData?.productDetail?.map((item, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-100 py-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                    onClick={() => {
                      router.push(
                        `/orders-details/${cartData?._id}?product_id=${item?._id}`
                      );
                    }}
                  >
                    <div className="flex items-center justify-center p-1 bg-white shadow-md rounded-lg">
                      <div className=" bg-gray-50 rounded-lg ">
                        <img
                          className="w-[80px] h-[140px] object-contain"
                          src={item?.image[0]}
                          alt={item?.product?.name}
                        />
                      </div>

                      <div className="ml-4 flex-grow">
                        <p className="text-gray-800 font-semibold text-[16px]">
                          {item?.product?.name}
                        </p>
                        <div className="flex flex-wrap ">
                          <div className="flex flex-col items-start mt-1">
                            <div className="flex mt-1">
                              <span className="text-gray-700 text-sm mr-1 font-medium">
                                Qty:
                              </span>
                              <span className="text-gray-700 text-sm">
                                {item?.qty}
                              </span>
                            </div>

                            {item?.color && (
                              <div className="flex mt-1">
                                <span className="text-gray-700 text-sm mr-1 font-medium">
                                  Color:
                                </span>
                                <span className="text-gray-700 text-sm">
                                  {item?.color || "N/A"}
                                </span>
                              </div>
                            )}
                            {item?.attribute &&
                              Object.entries(item.attribute)
                                .filter(
                                  ([key]) => key.toLowerCase() !== "color"
                                )
                                .map(([label, value], index) => (
                                  <div
                                    key={index}
                                    className="text-gray-700 text-sm mb-1 font-medium"
                                  >
                                    {label}:{" "}
                                    <span className="text-gray-700 text-sm">
                                      {value || "Not found"}
                                    </span>
                                  </div>
                                ))}
                          </div>
                        </div>
                      </div>

                      <div className="ml-auto">
                        <p className="text-[#127300] font-semibold text-lg">
                          ${item?.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Information */}
              <div className="px-5 pt-6">
                {/* Order Status */}
                {cartData?.status === "Completed" && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 font-medium">
                          Order has been delivered successfully
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {cartData?.status === "Return" && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 font-medium">
                          Order has been Return successfully
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Section - Fixed at Bottom */}
            <div className="fixed bottom-0  right-0 bg-white px-2 py-2 border-t border-gray-200 md:w-[43vw] w-[380px]">
              <button className="bg-[#127300] w-full py-4 rounded-lg text-white text-lg font-bold flex justify-center items-center">
                Total: ${cartData?.total}
              </button>
            </div>
          </div>
        </Drawer>

        <div className="bg-white  rounded-xl   border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-20">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                style={{ borderColor: primaryColor }}
              ></div>
            </div>
          ) : userRquestList.length === 0 ? (
            <div className="flex flex-col justify-center items-center p-20 text-center">
              <img
                src="/empty-box.png"
                alt="No data"
                className="w-32 h-32 mb-4 opacity-60"
              />
              <h3 className="text-xl font-medium text-gray-700 mb-1">
                No Orders found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search OrderId
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={userRquestList}
                pagination={pagination}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                itemsPerPage={pagination.itemsPerPage}
              />
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default isAuth(Orders);
