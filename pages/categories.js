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
  const subCategoryRef = useRef();
  const [data, setData] = useState({ name: "" });
  const [categories, setCategories] = useState([]);
  const [subData, setSubData] = useState({ name: "", categoryId: "", Attribute: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [hideCategory, setHideCategory] = useState(true);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [addAttribute, setAddAttribute] = useState([]);
  const [attribute, setAttribute] = useState("");
  const [notAvailableSubCategory, setNotAvailableSubCategory] = useState(false)

  const scrollToCategory = () => {
    categoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToSubCategory = () => {
    subCategoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      const res = await Api("get", "getCategories", "", router);
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

    if (notAvailableSubCategory) {
      if (addAttribute.length === 0) {
        return props.toaster({
          type: "error",
          message: "Please add at least one attribute.",
        });
      }
      data.Attribute = addAttribute;
    }

    data.notAvailableSubCategory = notAvailableSubCategory;

    const method = data._id ? "post" : "post";
    const url = data._id ? `updateCategory` : `createCategory`;
    console.log(data)

    try {
      await Api(method, url, data, router);
      setData({ name: "" });
      setAddAttribute([])
      setNotAvailableSubCategory(false)
      getAllCategories();
    } catch (err) {
      props.toaster({ type: "error", message: err?.message });
    }
  };

  const submitSubcategory = async (e) => {
    e.preventDefault();
    if (!subData.name || !subData.categoryId) {
      props.toaster({ type: "error", message: "Please fill in all fields." });
      return;
    }

    if (addAttribute.length === 0) {
      return props.toaster({
        type: "error",
        message: "Please add at least one attribute.",
      });
    }

    subData.Attribute = addAttribute;
    const method = subData._id ? "post" : "post";
    const url = subData._id ? `updateSubcategory` : `addSubcategory`;

    try {
      await Api(method, url, subData, router);
      setSubData({ name: "", categoryId: "" });
      setShowSubcategoryForm(false);
      setHideCategory(true);
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
    });
    const data = {
      id: _id,
    };
    if (result.isConfirmed) {
      try {
        await Api("delete", `deleteCategory`, data, router);
        getAllCategories();
      } catch (err) {
        props.toaster({ type: "error", message: err?.message });
      }
    }
  };

  const deleteSubcategory = async (categoryId, subId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to proceed with the deletion?",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    const data = {
      categoryId: categoryId,
      subId: subId,
    };
    if (result.isConfirmed) {
      try {
        await Api("delete", `deleteSubcategory`, data, router);
        getAllCategories();
      } catch (err) {
        props.toaster({ type: "error", message: err?.message });
      }
    }
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleEditSubcategory = (subcategory, categoryId, Attribute) => {
    setSubData({
      ...subcategory,
      categoryId: categoryId,
      Attribute: Attribute,
    });
    setShowSubcategoryForm(true);
    setHideCategory(false);
  };

  const handleCancelSubcategory = () => {
    setHideCategory(true);
    setSubData({ name: "", categoryId: "" });
    setShowSubcategoryForm(false);
  };

  const AvailableSubCategoryCategory = categories.filter(
    (item) => item.notAvailableSubCategory === false
  );


  return (
    <section className="w-full h-full md:pt-5 pt-5 pl-5 pr-5 overflow-y-scroll scrollbar-hide overflow-scroll pb-28">
      <p className="font-bold text-black md:text-[32px] text-2xl">
        Manage Categories
      </p>

      {hideCategory && (
        <div className="border md:my-10 my-5 border-gray-200 rounded-[10px] p-5 flex flex-col justify-center items-center"
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
            <div className="flex my-2 justify-start gap-8">
              <input
                type="checkbox"
                value="notAvailableCategory"
                checked={notAvailableSubCategory}
                onChange={(e) => {
                  setNotAvailableSubCategory(e.target.checked); // ✅ gives true or false
                }}
                className="w-4 h-4"
              />
              <label className="text-gray-700">
                Subcategories Not Available
              </label>
            </div>


            {notAvailableSubCategory && (
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
                    className="bg-[#28a745] px-5 font-semibold rounded-md md:py-3 py-2 text-white"
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
            )}


            <button
              className="md:h-[45px] h-[40px] md:w-[324px] w-[300px] bg-[#28a745] rounded-[10px] md:text-lg text-base text-white cursor-pointer font-semibold"
              type="submit"
            >
              {data._id ? "Update Category" : "Add Now"}
            </button>
          </form>
          {!showSubcategoryForm && (
            <div className="mb-5 mt-2">
              <button
                className="md:h-[45px] h-[40px] md:w-[324px] w-[300px] bg-[#28a745] rounded-[10px] md:text-lg text-base text-white cursor-pointer font-semibold"
                onClick={() => {
                  setHideCategory(false);
                  setShowSubcategoryForm(!showSubcategoryForm);
                }}
              >
                {showSubcategoryForm ? "Cancel" : "Add Subcategory"}
              </button>
            </div>
          )}
        </div>
      )}

      {showSubcategoryForm && (
        <form
          className="bg-white border flex flex-col justify-center items-center border-gray-200 rounded-[10px] p-5 mb-5  md:my-10 my-5"
          ref={subCategoryRef}
          onSubmit={submitSubcategory}
        >
          <select
            className="bg-gray-100 border border-custom-offWhite outline-none md:h-[50px] h-[40px] md:w-[500px] w-full rounded-[5px] px-5 text-sm font-normal text-black mb-3"
            value={subData.categoryId}
            onChange={(e) =>
              setSubData({ ...subData, categoryId: e.target.value })
            }
            required
          >
            <option value="">Select Category</option>
            {AvailableSubCategoryCategory.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            className="bg-gray-100 border border-custom-offWhite outline-none md:h-[50px] h-[40px] md:w-[500px] w-full rounded-[5px] px-5 text-sm font-normal text-black mb-3"
            type="text"
            placeholder="Name of Subcategory"
            value={subData.name}
            onChange={(e) => setSubData({ ...subData, name: e.target.value })}
            required
          />

          <div className="mt-0">
            <p className="text-gray-500 font-semibold text-sm pb-1 ">
              {"Attribute"}
            </p>
            <div className="flex gap-3 ">
              <input
                className="rounded-md text-black bg-gray-100 border border-custom-offWhite  border-custom-offWhite px-4 outline-none md:h-[50px] h-[40px] md:w-[415px] w-[310px] "
                type="text"
                value={attribute}
                placeholder="Enter Attribute"
                onChange={handleInput}
              />
              <button
                className="bg-[#28a745] px-5 font-semibold rounded-md md:py-3 py-2 text-white"
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
            className="md:h-[45px] h-[40px] md:w-[324px] w-full bg-[#28a745] rounded-[10px] md:text-lg text-base text-white cursor-pointer font-semibold"
            type="submit"
          >
            {subData._id ? "Update Subcategory" : "Add Subcategory"}
          </button>
          <button
            type="button"
            className="md:h-[45px] h-[40px] md:w-[324px]  w-full bg-[#28a745] rounded-[10px] md:text-lg text-base text-white cursor-pointer font-semibold mt-3"
            onClick={handleCancelSubcategory}
          >
            Cancel
          </button>
        </form>
      )}


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
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                {/* Expand/Collapse Icon */}
                {item.Subcategory && item.Subcategory.length > 0 && (
                  <div
                    className="mr-3 cursor-pointer"
                    onClick={() => toggleCategoryExpansion(item._id)}
                  >
                    {expandedCategories[item._id] ? (
                      <FiChevronDown className="md:h-[30px] h-[20px] md:w-[30px] w-[20px] text-[#F38529]" />
                    ) : (
                      <FiChevronRight className="md:h-[30px] h-[20px] md:w-[30px] w-[20px] text-[#F38529]" />
                    )}
                  </div>
                )}
                <FiEdit
                  className="md:h-[30px] h-[20px] md:w-[30px] w-[20px] text-[#F38529] mr-[20px] cursor-pointer"
                  onClick={() => {
                    setHideCategory(true);
                    setData(item);
                    setShowSubcategoryForm(false)
                    setAddAttribute(item.Attribute || []);
                    setNotAvailableSubCategory(item.notAvailableSubCategory)
                    scrollToCategory()
                  }}
                />
                <IoCloseCircleOutline
                  className="md:h-[30px] h-[20px] md:w-[30px] w-[20px] text-[#F38529] cursor-pointer"
                  onClick={() => deleteCategory(item._id)}
                />
              </div>
            </div>

            {/* Subcategories */}
            {expandedCategories[item._id] &&
              item.Subcategory &&
              item.Subcategory.length > 0 && (
                <div className="mt-3 ml-8">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Subcategories:
                  </h4>
                  {item.Subcategory.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex justify-between items-center bg-gray-100 border border-gray-200 rounded-[5px] p-3 mt-2"
                    >
                      <p className="text-black font-medium">{sub.name}</p>
                      <div className="flex">
                        <FiEdit
                          className="md:h-[25px] h-[18px] md:w-[25px] w-[18px] text-[#F38529] mr-[15px] cursor-pointer"
                          onClick={() => {
                            setAddAttribute(sub.Attribute)
                            scrollToSubCategory()
                            handleEditSubcategory(sub, item._id, sub.Attribute)
                          }}
                        />
                        <IoCloseCircleOutline
                          className="md:h-[25px] h-[18px] md:w-[25px] w-[18px] text-[#F38529] cursor-pointer"
                          onClick={() => deleteSubcategory(item._id, sub._id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
    </section>
  );
}

export default isAuth(Categories);
