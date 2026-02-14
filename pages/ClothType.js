import { Api } from "../services/service";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FiEdit, FiSearch, FiPlus, FiImage } from "react-icons/fi";
import { IoCloseCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import isAuth from "../components/isAuth";

function ClothType(props) {
  const router = useRouter();
  const ClothTypeRef = useRef();
  const [data, setData] = useState({ name: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [ClothTypes, setClothTypes] = useState([]);

  useEffect(() => {
    getAllClothTypes();
  }, []);

  const scrollToClothType = () => {
    ClothTypeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const getAllClothTypes = async () => {
    props.loader(true);
    try {
      const res = await Api("get", "clothtype/list", "", router);
      setClothTypes(res.data);
    } catch (err) {
      props.toaster({ type: "error", message: err?.message });
    } finally {
      props.loader(false);
    }
  };

  const submitClothType = async (e) => {
    e.preventDefault();
    if (!data.name) {
      props.toaster({
        type: "error",
        message: "Please fill in the ClothType name.",
      });
      return;
    }

    const method = data._id ? "post" : "post";
    const url = data._id ? `clothtype/update` : `clothtype/create`;

    try {
      await Api(method, url, data, router);
      setData({ name: "" });
      getAllClothTypes();
    } catch (err) {
      props.toaster({ type: "error", message: err?.message });
    }
  };

  const deleteClothType = async (_id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to proceed with the deletion?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    const data = { id: _id };
    if (result.isConfirmed) {
      try {
        await Api("delete", `clothtype/delete`, data, router);
        getAllClothTypes();
      } catch (err) {
        props.toaster({ type: "error", message: err?.message });
      }
    }
  };

  return (
    <section className="w-full h-full md:pt-6 pt-4 px-4 md:px-6 overflow-y-scroll scrollbar-hide overflow-scroll pb-28 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-bold text-slate-800 md:text-[32px] text-2xl">
          Cloth Type Management
        </h1>
        <p className="text-gray-600 mt-1">
          Note: This section is used to manage categories for all sustainable
          products such as clothing, handmade jewellery, and other eco-friendly
          items.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-6 mb-8 shadow-lg shadow-slate-200/50">
        <div className="flex items-center mb-6" ref={ClothTypeRef}>
          <div className="bg-black p-2 rounded-lg mr-3">
            <FiPlus className="text-white w-5 h-5" />
          </div>
          <h2 className="text-slate-800 font-semibold text-lg">
            Add New Cloth Type
          </h2>
        </div>

        <form className="space-y-6" onSubmit={submitClothType}>
          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Cloth Type Name
            </label>
            <input
              className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 h-12 rounded-xl px-4 text-slate-800 font-medium"
              type="text"
              placeholder="Enter Cloth Type name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
            />
          </div>

          <button
            className="w-full h-12 bg-black rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 transform hover:-translate-y-0.5 cursor-pointer"
            type="submit"
          >
            {data._id ? "Update Cloth Type" : "Add Cloth Type"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-lg shadow-slate-200/50">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 h-12 pl-12 pr-4 rounded-xl text-slate-800 font-medium"
            type="text"
            placeholder="Search Cloth Types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ClothTypes List */}
      <div className="space-y-4">
        {ClothTypes.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ).map((item, index) => (
          <div
            key={item._id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <div className="ml-4 flex items-center">
                  <div>
                    <p className="text-slate-800 font-semibold text-lg">
                      {item.name}
                    </p>
                    <p className="text-slate-500 text-sm">
                      Cloth Type #{index + 1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  className="p-3 bg-gradient-to-r bg-black rounded-xl text-white transition-all duration-200 shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-300/50 cursor-pointer transform hover:-translate-y-0.5"
                  onClick={() => {
                    setData(item);
                    scrollToClothType();
                  }}
                >
                  <FiEdit className="w-5 h-5" />
                </button>

                <button
                  className="p-3 bg-black rounded-xl text-white transition-all duration-200 shadow-lg shadow-red-200/50 cursor-pointer hover:shadow-xl hover:shadow-red-300/50 transform hover:-translate-y-0.5"
                  onClick={() => deleteClothType(item._id)}
                >
                  <IoCloseCircleOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ClothTypes.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ).length === 0 && (
        <div className="text-center py-16">
          <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-slate-600 font-semibold text-lg mb-2">
            No Cloth Types found
          </h3>
          <p className="text-slate-500">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Add your first Cloth Type to get started"}
          </p>
        </div>
      )}
    </section>
  );
}

export default isAuth(ClothType);
