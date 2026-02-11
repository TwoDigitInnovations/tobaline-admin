import { Api } from "../services/service";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FiEdit, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { IoCloseCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import isAuth from "../components/isAuth";

function Categories(props) {
  const router = useRouter();
  const categoryRef = useRef();
  const [data, setData] = useState({ name: "" });
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addAttribute, setAddAttribute] = useState([]);
  const [attribute, setAttribute] = useState("");
  const [notAvailableSubCategory, setNotAvailableSubCategory] = useState(false);

  const scrollToCategory = () => {
    categoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleInput = (e) => {
    setAttribute(e.target.value);
  };

  const inputAttribute = (e) => {
    e.preventDefault();
    if (attribute.trim() === "") return;
    setAddAttribute((prev) => [...prev, { name: attribute, id: Date.now() }]);
    setAttribute("");
  };

  const deleteAttribute = (id) => {
    setAddAttribute((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const getAllCategories = async () => {
    props.loader(true);
    try {
      const res = await Api("get", "category/getCategories", "", router);
      setCategories(res.data);
    } catch (err) {
      props.toaster({ type: "error", message: err?.message });
    } finally {
      props.loader(false);
    }
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    if (!data.name) {
      props.toaster({
        type: "error",
        message: "Please fill in the category name.",
      });
      return;
    }

    if (addAttribute.length === 0) {
      return props.toaster({
        type: "error",
        message: "Please add at least one attribute.",
      });
    }

    data.Attribute = addAttribute;
    const method = data._id ? "post" : "post";
    const url = data._id
      ? `category/updateCategory`
      : `category/createCategory`;
    console.log(data);

    try {
      await Api(method, url, data, router);
      setData({ name: "" });
      setAddAttribute([]);
      getAllCategories();
    } catch (err) {
      props.toaster({ type: "error", message: err?.message });
    }
  };

  const deleteCategory = async (_id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to proceed with the deletion?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor:"#000"
    });
    const data = {
      id: _id,
    };
    if (result.isConfirmed) {
      try {
        await Api("delete", `category/deleteCategory`, data, router);
        getAllCategories();
      } catch (err) {
        props.toaster({ type: "error", message: err?.message });
      }
    }
  };

  return (
    <section className="w-full h-full md:pt-5 pt-5 pl-5 pr-5 overflow-y-scroll scrollbar-hide overflow-scroll pb-28">
      <p className="font-bold text-black md:text-[32px] text-2xl">
        Manage Categories
      </p>

      <div
        className="border md:my-10 my-5 border-gray-200 rounded-[10px] p-5 flex flex-col justify-center items-center"
        ref={categoryRef}
      >
        <p className="text-gray-500 mt-4 mb-3 font-semibold ">
          {" "}
          Add Categories
        </p>
        <form
          className=" flex flex-col justify-center items-center bg-white "
          onSubmit={submitCategory}
        >
          <input
            className="bg-gray-100 border border-custom-offWhite outline-none md:h-[50px] h-[40px] md:w-[600px] w-[350px] rounded-[5px] px-5 text-sm font-normal text-black mb-6"
            type="text"
            placeholder="Name of Category"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
          />

          <div className="mt-0">
            <p className="text-gray-500 font-semibold text-sm pb-1 ">
              {"Attribute"}
            </p>
            <div className="flex gap-3 ">
              <input
                className="rounded-md text-black bg-gray-100 border border-custom-offWhite  border-custom-offWhite px-4 outline-none md:h-[50px] h-[40px] md:w-[515px] w-[270px] "
                type="text"
                value={attribute}
                placeholder="Enter Attribute"
                onChange={handleInput}
              />
              <button
                className="bg-black px-5 font-semibold rounded-md md:py-3 py-2 text-white"
                onClick={inputAttribute}
              >
                {"Add"}
              </button>
            </div>

            <div className="mt-5">
              <ul>
                {addAttribute?.map((item, id) => (
                  <div className="flex border w-full justify-between rounded-md bg-custom-lightGrayInputBg my-4 py-1 items-center px-2">
                    <li key={id} className="text-black font-bold">
                      {item?.name}
                    </li>
                    <div className="flex text-2xl gap-2 pt-1">
                      <IoCloseCircleOutline
                        className="text-gray-600 text-3xl cursor-pointer"
                        onClick={() => deleteAttribute(item.id)}
                      />
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          </div>

          <button
            className="md:h-[45px] h-[40px] md:w-[324px] w-[300px] bg-black rounded-[10px] md:text-lg text-base text-white cursor-pointer font-semibold"
            type="submit"
          >
            {data._id ? "Update Category" : "Add Now"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-custom-lightsGrayColor rounded-[10px] p-5 mb-5">
        <input
          className="bg-gray-100 text-black border border-gray-100 outline-none h-[40px] md:w-[435px] w-full px-5 rounded-[10px] text-custom-darkBlack font-semibold text-base"
          type="text"
          placeholder="Search Categories"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {categories
        .filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-100 rounded-[10px] p-5 mt-5"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex justify-start items-center">
                <p className="text-base text-black font-semibold pl-5">
                  {item.name}
                </p>
              </div>
              <div className="flex justify-center items-center">
                <FiEdit
                  className="md:h-[30px] h-[20px] md:w-[30px] w-[20px] text-black mr-[20px] cursor-pointer"
                  onClick={() => {
                    setData(item);
                    setAddAttribute(item.Attribute || []);
                    scrollToCategory();
                  }}
                />
                <IoCloseCircleOutline
                  className="md:h-[30px] h-[20px] md:w-[30px] w-[20px] text-black cursor-pointer"
                  onClick={() => deleteCategory(item._id)}
                />
              </div>
            </div>
          </div>
        ))}
    </section>
  );
}

export default isAuth(Categories);
