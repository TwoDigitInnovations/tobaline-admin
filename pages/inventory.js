import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "../components/table";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaCopy } from "react-icons/fa";
import { Api, FileDownloadApi } from "../services/service";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { userContext } from "./_app";
import isAuth from "../components/isAuth";

function Inventory(props) {
  const router = useRouter();
  const [productsList, setProductsList] = useState([]);
  const [user, setUser] = useContext(userContext);

  const [selectedNewSeller, setSelectedNewSeller] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [value, setValue] = useState("");
  const [themeData, setThemeData] = useState([]);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 4,
  });

  useEffect(() => {
    getProduct(currentPage);
  }, [user, currentPage]);

  const getProduct = async (page = 1, limit = 10) => {
    props.loader(true);

    let url = `getProduct?page=${page}&limit=${limit}`;

    Api("get", url, router).then(
      (res) => {
        props.loader(false);
        setProductsList(res.data);
        const selectednewIds = res.data.map((f) => {
          if (f.sponsered && f._id) return f._id;
        });
        setSelectedNewSeller(selectednewIds);
        setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const filteredProducts = productsList.filter((item) => {
    if (searchTerm === "") {
      return item;
    } else if (
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return item;
    }
  });

  const image = ({ value, row }) => {
    return (
      <div className="flex flex-col items-center justify-center">
        {row.original &&
          row.original.varients &&
          row.original.varients.length > 0 && (
            <img
              className="md:h-[116px] md:w-[126px] h-20 w-40 object-contain  rounded-md"
              src={row.original.varients[0].image[0]}
              alt="Product"
              onError={(e) => {
                e.target.src = "/placeholder-image.png"; // Add fallback image
              }}
            />
          )}
      </div>
    );
  };

  const productName = ({ value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value || "N/A"}</p>
      </div>
    );
  };

  const category = ({ row, value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">
          {row.original?.categoryName?.toString() || "N/A"}
        </p>
      </div>
    );
  };

  const price = ({ row }) => {
    const value = row.original?.varients?.[0]?.selected?.[0]?.offerprice;
    const formattedPrice =
      !isNaN(value) && value !== null && value !== undefined
        ? parseFloat(value).toFixed(2)
        : "0.00";

    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">${formattedPrice}</p>
      </div>
    );
  };

  const piece = ({ row }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">
          {row.original.pieces}
        </p>
      </div>
    );
  };

  const availableColor = ({ value }) => {
    if (!value || !Array.isArray(value)) {
      return (
        <div className="p-4 flex items-center justify-center">
          <p className="text-gray-500 text-sm">No colors</p>
        </div>
      );
    }

    return (
      <div className="p-4 flex items-center justify-center gap-2 max-w-80 flex-wrap">
        {value.map((item, i) => (
          <div
            key={i}
            className="text-base font-normal rounded-full h-5 w-5 border border-black"
            style={{ background: item?.color || "#ccc" }}
            title={item?.colorName || "Color"}
          ></div>
        ))}
      </div>
    );
  };

  const handleEditProduct = (product) => {
    router.push(`/add-product?id=${product._id}`);
  };

  const actionHandler = ({ value, row }) => {
    return (
      <div className="bg-custom-offWhiteColor flex items-center justify-evenly border border-custom-offWhite rounded-[10px] mr-[10px]">
        <div
          className="py-[10px] w-[50%] items-center flex justify-center border-l-[1px] border-custom-offWhite cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => handleEditProduct(row.original)}
          title="Edit Product"
        >
          <FiEdit className="text-[22px] text-green-600" />
        </div>
        <div
          className="py-[10px] border-l-[1px] border-custom-offWhite w-[50%] items-center flex justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => deleteProduct(row.original._id)}
          title="Delete Product"
        >
          <RiDeleteBinLine className="text-[red] text-[24px]" />
        </div>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "Image",
        accessor: "username",
        Cell: image,
      },
      {
        Header: "Product Name",
        accessor: "name",
        Cell: productName,
      },
      {
        Header: "Category",
        accessor: "category",
        Cell: category,
      },
      {
        Header: "Price",
        // accessor: "price",
        Cell: price,
      },
      {
        Header: "Unit",
        // accessor: "pieces",
        Cell: piece,
      },
      {
        Header: "Available Color",
        accessor: "varients",
        Cell: availableColor,
      },
      {
        Header: "ACTION",
        Cell: actionHandler,
      },
    ],
    [themeData] // Added dependency
  );

  const deleteProduct = (_id) => {
    Swal.fire({
      text: "Are you sure? You want to proceed with the delete?",
      showCancelButton: true,
      cancelButtonColor: "#127300",
      confirmButtonText: "Delete",
      confirmButtonColor: "#127300",
      width: "380px",
    }).then(function (result) {
      if (result.isConfirmed) {
        const data = {
          _id,
        };

        props.loader(true);
        Api("delete", `deleteProduct/${_id}`, data, router).then(
          (res) => {
            console.log("res================>", res.data?.message);
            props.loader(false);

            if (res?.status) {
              getProduct(currentPage);
              props.toaster({
                type: "success",
                message: res.data?.message || "Product deleted successfully",
              });
            } else {
              console.log(res?.data?.message);
              props.toaster({
                type: "error",
                message: res?.data?.message || "Failed to delete product",
              });
            }
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({
              type: "error",
              message:
                err?.data?.message || err?.message || "An error occurred",
            });
          }
        );
      }
    });
  };



  return (
    <div className="w-full h-full bg-transparent py-5 md:px-5 ">
      <div className="h-full">
        <div className="flex justify-between items-center px-4">
          <p className="text-black font-bold md:text-[32px] text-2xl">
            Inventory
          </p>
        </div>
        <div className="bg-white pt-5 md:pb-32 px-5 rounded-[12px] h-full overflow-y-scroll scrollbar-hide overflow-scroll pb-28 md:mt-5 mt-5">
          <div className="">
            <div className="flex md:flex-row flex-col md:justify-between md:items-end gap-3">
              <input
                className="bg-gray-100 text-black border border-gray-100 outline-none h-[40px] md:w-[435px] w-full px-5 rounded-[10px] text-custom-darkBlack font-semibold text-base"
                type="text"
                placeholder="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button
                className="text-white bg-[#127300] px-5 py-2.5 rounded cursor-pointer hover:bg-[#0f5f00] transition-colors"
                onClick={() => router.push("/add-product")}
              >
                Add Product
              </button>
            </div>

            <div className="mt-5">
              <Table
                columns={columns}
                data={filteredProducts}
                pagination={pagination}
                onPageChange={(page) => setCurrentPage(page)}
                currentPage={currentPage}
                itemsPerPage={pagination?.itemsPerPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default isAuth(Inventory);
