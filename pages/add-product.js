import Table from "../components/table";
import { Api, ApiFormData } from "../services/service";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { MdOutlineFileUpload } from "react-icons/md";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import _ from "underscore";
import { produce } from "immer";
import { IoCloseCircleOutline } from "react-icons/io5";
import dynamic from "next/dynamic";
import Compressor from "compressorjs";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const config = {
  readonly: false,
  height: 400,
  spellcheck: true,
  toolbarAdaptive: false,
  toolbarSticky: false,
  showCharsCounter: true,
  askBeforePasteHTML: false,   // ✅ direct paste allow
  askBeforePasteFromWord: false,
  pasteHTMLAction: "insert",
  showWordsCounter: true,
  showXPathInStatusbar: false,
  buttons: [
    "bold", "italic", "underline", "strikethrough",
    "|",
    "ul", "ol", "outdent", "indent",
    "|",
    "fontsize", "paragraph", "brush",
    "|",
    "image", "link", "table",
    "|",
    "left", "center", "right", "justify",
    "|",
    "undo", "redo",
    "|",
    "eraser", "copyformat", "hr", "source"
  ],
  uploader: { insertImageAsBase64URI: true }
};

function Products(props) {
  const router = useRouter();
  const editor = useRef(null);

  const [productsData, setProductsData] = useState({
    category: "",
    subcategory: "",
    categoryName: "",
    parameter_type: "",
    subCategoryName: "",
    brandName: "",
    Brand: "",
    gender: "",
    name: "",
    short_description: "",
    long_description: "",
    price_slot: [
      {
        value: 0,
        price: 0,
        Offerprice: 0,
      },
    ],
    Quantity: "",
  });

  const [varients, setvarients] = useState([
    {
      color: "",
      image: [],
      selected: [],
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [color, setColor] = useColor("#000000");
  const [openPopup, setOpenPopup] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const forms = useRef();
  const [value, setValue] = useState("");
  const [filterCategoryData, setFilterCategoryData] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [singleImgs, setSingleImgs] = useState([]);
  const fileRefs = useRef([]);


  const getAllBrands = async () => {
    props.loader(true);
    try {
      const res = await Api("get", "getBrands", "", router);
      setBrands(res.data);
    } catch (err) {
      props.toaster({ type: "error", message: err?.message });
    } finally {
      props.loader(false);
    }
  };


  useEffect(() => {
    getCategory();
    getAllBrands();
  }, []);


  useEffect(() => {
    if (router.isReady && router.query.id) {
      getProductById(router.query.id);
    }
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    if (productsData?.Attribute) {
      if (productsData?.varients?.length) {
        const normalizedVarients = productsData.varients.map((variant) => ({
          ...variant,
          selected: variant.selected?.map((sel) => ({
            attributes: productsData.Attribute.map((attr) => {
              const existingAttr = sel.attributes?.find(
                (a) => a.label.toLowerCase() === attr.name.toLowerCase()
              );
              return {
                label: attr.name,
                value: existingAttr?.value || ""
              };
            }),
            qty: sel.qty || "",
            price: sel.price || "",
            offerprice: sel.offerprice || ""
          })) || []
        }));

        setvarients(normalizedVarients);
      } else {
        const attrGroup = {
          attributes: productsData.Attribute.map(attr => ({
            label: attr.name,
            value: ""
          })),
          qty: "",
          price: "",
          offerprice: ""
        };

        setvarients([
          {
            color: "",
            image: [],
            selected: [attrGroup]
          }
        ]);
      }
    }
  }, [productsData?.Attribute]);



  useEffect(() => {
    fileRefs.current = Array(varients.length)
      .fill()
      .map((_, i) => fileRefs.current[i] || React.createRef());
  }, [varients.length]);

  const handleClose = () => {
    setOpenPopup(false);
  };

  const getCategory = async () => {
    props.loader(true);
    Api("get", "getCategories", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.data) {
          setCategoryData(res?.data);
          setFilterCategoryData(res?.data);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getProductById = async (id) => {
    if (!id) {
      console.error("Invalid product ID");
      return;
    }
    props.loader(true);
    Api("get", `getProductById/${id}`, "", router).then(
      (res) => {
        props.loader(false);
        if (res?.data) {
          const product = res.data;

          setProductsData({
            category: product.category || "",
            categoryName: product.categoryName || "",
            subcategory: product.subcategory || "",
            subCategoryName: product.subCategoryName || "",
            name: product.name || "",
            brandName: product.brandName || "",
            Brand: product.Brand || "",
            gender: product.gender || "",
            parameter_type: product.parameter_type || "",
            short_description: product.short_description || "",
            long_description: product.long_description || "",
            offer: product.offer || "",
            Attribute: product.Attribute || [],
            varients: product.varients || []
          });



          setSelectedCategory(product.category);
          const selectedCategory = categoryData.find(
            (cat) => cat._id === product.category
          );

          setFilteredSubCategories(selectedCategory?.Subcategory || []);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };


  useEffect(() => {
    const newdata = categoryData.filter((f) => f.parameter_type === value);
    setFilterCategoryData(newdata);
  }, [value]);

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setSelectedCategory(selectedCategoryId);

    const selectedCategoryObj = categoryData.find(
      (category) => category._id === selectedCategoryId
    );

    setFilteredSubCategories(
      selectedCategoryObj ? selectedCategoryObj.Subcategory : []
    );

    setProductsData({
      ...productsData,
      category: selectedCategoryId,
      categoryName: selectedCategoryObj ? selectedCategoryObj.name : "",
      subcategory: "",
      subCategoryName: "",
      Attribute: selectedCategoryObj?.Attribute || [],
    });
  };

  const handleSubCategoryChange = (e) => {
    const selectedSubCategoryId = e.target.value;

    const selectedSubCategoryObj = filteredSubCategories.find(
      (subcategory) => subcategory._id === selectedSubCategoryId
    );

    setProductsData((prev) => ({
      ...prev,
      subcategory: selectedSubCategoryId,
      Attribute: selectedSubCategoryObj?.Attribute || [],
      subCategoryName: selectedSubCategoryObj
        ? selectedSubCategoryObj.name
        : "",
    }));
  };


  useEffect(() => {
    if (productsData?.category && categoryData?.length) {
      const matchedCategory = categoryData.find(
        (cat) => cat._id === productsData.category._id
      );

      if (matchedCategory) {
        setSelectedCategory(matchedCategory._id);
        setFilteredSubCategories(matchedCategory.Subcategory || []);

        const matchedSubCategory = matchedCategory.Subcategory?.find(
          (sub) => sub._id === productsData.subcategory
        );

        setProductsData((prev) => ({
          ...prev,
          category: matchedCategory,
          subcategory: matchedSubCategory?._id || prev.subcategory,
        }));
      }
    }

    if (productsData?.Brand && brands?.length) {
      const matchedBrand = brands.find((b) => b._id === productsData.Brand._id);

      if (matchedBrand) {
        setProductsData((prev) => ({
          ...prev,
          brandName: matchedBrand.name,
          Brand: matchedBrand._id,
        }));
      }
    }
  }, [productsData?.category, categoryData, productsData?.Brand, brands]);

  const handleBrandChange = (e) => {
    const selectedBrandId = e.target.value;

    const selectedBrandObj = brands.find(
      (brand) => brand._id === selectedBrandId
    );

    setProductsData({
      ...productsData,
      Brand: selectedBrandId,
      brandName: selectedBrandObj ? selectedBrandObj.name : "",
    });
  };

  const createProduct = async (e) => {
    e.preventDefault();

    const sumWithInitial = varients.reduce(
      (accumulator, currentValue) =>
        accumulator +
        currentValue.selected.reduce(
          (total, currentVal) =>
            total + (Number(currentVal.qty) || 0),
          0
        ),
      0
    );

    const data = {
      ...productsData,
      varients,
      pieces: sumWithInitial,
    };

    props.loader(true);

    console.log("data================>", data);
    Api("post", "createProduct", data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res.status) {

          setProductsData({
            category: "",
            categoryName: "",
            subcategory: "",
            subCategoryName: "",
            name: "",
            price: "",
            img: "",
            brandName: "",
            gender: "",
            short_description: "",
            long_description: "",
            offer: "",
            price_slot: [
              {
                value: 0,
                price: 0,
              },
            ],
            minQuantity: "",
          });

          setvarients([
            {
              color: "",
              image: [],
              selected: [],
            },
          ]);

          setSelectedCategory("");
          setFilteredSubCategories([]);

          router.push("/inventory");
          props.toaster({ type: "success", message: res.data?.message });
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    const sumWithInitial = varients.reduce(
      (accumulator, currentValue) =>
        accumulator +
        currentValue.selected.reduce(
          (total, currentVal) => total + Number(currentVal.qty),
          0
        ),
      0
    );

    const data = {
      ...productsData,
      varients,
      pieces: sumWithInitial,
      id: router.query.id,
    };

    props.loader(true);
    console.log("data called update Api", data);

    Api("post", "updateProduct", data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);

        if (res.status) {
          setProductsData({
            category: "",
            categoryName: "",
            subcategory: "",
            subCategoryName: "",
            name: "",
            price: "",
            brand: "",
            brandName: "",
            gender: "",
            img: "",
            short_description: "",
            long_description: "",
            offer: "",
            price_slot: [
              {
                value: 0,
                price: 0,
              },
            ],
            minQuantity: "",
            theme: "",
            themeName: "",
            decoration_method: [],
            decoration_location: [],
          });

          setvarients([
            {
              color: "",
              image: [],
              selected: [],
            },
          ]);

          setSelectedCategory("");
          setFilteredSubCategories([]);
          router.push("/inventory");
          props.toaster({ type: "success", message: res.data?.message });
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };


  const [crop, setCrop] = useState({
    unit: "px",
    x: 0,
    y: 0,
    width: 200,   // default
    height: 200,  // default
    aspect: 1,    // optional (square maintain karne ke liye)
  });



  const [src, setSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropIndex, setCropIndex] = useState(null);

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleImageChange = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    setCropIndex(index);
    setSrc(URL.createObjectURL(file));
    // setCurrentIndex(i);
  };

  const handleCropConfirm = async (index) => {
    const imageElement = document.querySelector("#crop-image");
    const croppedBlob = await getCroppedImg(imageElement, crop);

    const fileSizeInMb = croppedBlob.size / (1024 * 1024);
    if (fileSizeInMb > 1) {
      props.toaster({
        type: "error",
        message: "Too large file. Please upload a smaller image",
      });
      return;
    }

    new Compressor(croppedBlob, {
      quality: 0.6,
      success: (compressedResult) => {
        const data = new FormData();
        data.append("file", compressedResult);
        props.loader(true);

        ApiFormData("post", "user/fileupload", data, router).then(
          (res) => {
            props.loader(false);
            if (res.status) {
              const updatedImgs = [...singleImgs];
              updatedImgs[cropIndex] = res.data.file || res.data.fileUrl;
              setSingleImgs(updatedImgs);
              props.toaster({ type: "success", message: res.data.message });
              setSrc(null);
            }
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message });
          }
        );
      },
    });
  };

  const closeIcon = (item, inx, imagesArr, i) => {
    console.log(item);
    console.log(varients[i]);

    const nextState = produce(imagesArr, (draftState) => {
      if (inx !== -1) {
        draftState.splice(inx, 1);
      }
    });
    console.log(nextState);

    setvarients(
      produce((draft) => {
        console.log(draft);
        draft[i].image = nextState;
      })
    );
  };

  const colorCloseIcon = (item, i) => {
    let data = [];
    varients.forEach((item, inx) => {
      if (inx !== i) data.push(item);
    });
    setvarients([...data]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductsData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section className=" w-full h-full bg-transparent !p-4 !md:p-5 ">
      <div className=" h-full">
        <h1 className="text-2xl md:text-3xl font-semibold text-black  md:mt-2 mt-2 md:mb-5 mb-5 md:ps-4">
          {router.query.id ? "Update Product" : "Add Product"}
        </h1>

        <div className="h-full bg-white rounded-[15px] md:p-5 overflow-scroll no-scrollbar md:pb-28 pb-28">
          <form
            ref={forms}
            className="w-full border-b-4 border-gray-400 pb-5"
            onSubmit={router.query.id ? updateProduct : createProduct}
          >
            <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
              <div className="flex flex-col justify-start items-start mb-2">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  Category <span className="text-red-500">*</span>
                </p>
                <div className="w-full bg-custom-light border border-gray-300 rounded">
                  <select
                    className="w-full md:h-[42px] h-[40px] bg-custom-light outline-none font-normal text-sm text-black NunitoSans"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categoryData.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col justify-start items-start mb-2">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  Sub Category <span className="text-red-500">*</span>
                </p>
                <div className="w-full bg-custom-light border border-gray-300 rounded">
                  <select
                    className="w-full md:h-[42px] h-[40px] bg-custom-light outline-none font-normal text-sm text-black NunitoSans"
                    value={productsData?.subcategory || ""}
                    onChange={handleSubCategoryChange}
                    disabled={!selectedCategory || selectedCategory?.notAvailableSubCategory}
                    required={selectedCategory?.notAvailableSubCategory === false}
                  >
                    <option value="" disabled>
                      Select Sub Category
                    </option>
                    {filteredSubCategories?.map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col justify-start items-start">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  Brand
                </p>
                <div className="px-3 w-full bg-custom-light border border-gray-300 rounded">
                  <select
                    value={productsData.Brand}
                    onChange={handleBrandChange}
                    className="w-full md:h-[42px] h-[40px] bg-custom-light outline-none font-normal text-sm text-black NunitoSans"
                  >
                    <option value="">Select a Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col justify-start items-start">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  Product Name
                </p>
                <input
                  type="text"
                  className="w-full md:h-[42px] h-[40px] bg-custom-light border border-gray-300 px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                  placeholder="Enter Product Name"
                  value={productsData.name}
                  name="name"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col justify-start items-start">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  Short Description
                </p>
                <input
                  type="text"
                  className="w-full md:h-[42px] h-[40px] bg-custom-light border border-gray-300 px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                  placeholder="Enter Short Description"
                  value={productsData.short_description}
                  name="short_description"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col justify-start items-start">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  Gender
                </p>
                <div className="px-3 w-full bg-custom-light border border-gray-300 rounded">
                  <select
                    name="gender"
                    onChange={handleChange}
                    value={productsData.gender}
                    className="w-full md:h-[42px] h-[40px] bg-custom-light outline-none font-normal text-sm text-black NunitoSans"
                    placeholder="Select Parameter Type"
                  >
                    <option value="" className="p-5">
                      Select Gender
                    </option>
                    <option value="Male" className="p-5">
                      Male
                    </option>
                    <option value="Female" className="p-5">
                      Female
                    </option>
                    <option value="Unisex" className="p-5">
                      Unisex
                    </option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col justify-start items-start md:col-span-2">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  Long Description
                </p>

                <div className="w-full text-black">
                  <JoditEditor
                    className="editor max-h-screen overflow-auto"
                    rows={10}
                    tabIndex={1}
                    value={productsData.long_description}
                    onBlur={(newContent) => {
                      setProductsData((prev) => ({
                        ...prev,
                        long_description: newContent,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border border-custom-lightGrays rounded-[8px] md:mt-10 mt-5 px-5 pt-5">
              <p className="text-black text-2xl font-bold	NunitoSans pb-5">
                Varients
              </p>
              {
                varients.map((item, i) => (
                  <div key={i} className="w-full" id={i}>
                    <div className="border border-custom-lightGrays  rounded-[8px] p-5 mb-5 relative">
                      <IoCloseCircleOutline
                        className="text-red-700 cursor-pointer h-5 w-5 absolute top-[20px] right-[20px]"
                        onClick={() => {
                          colorCloseIcon(item, i);
                        }}
                      />
                      <div
                        className="md:grid md:grid-cols-5 grid-cols-1 w-full md:gap-5"
                        id={"field-container-" + i}
                      >
                        {productsData?.Attribute?.some(attr => attr.name.toLowerCase() === "color") && (
                          <div className="">
                            <p className="text-gray-800 text-sm font-semibold NunitoSans pb-[15px] pl-[50px]">
                              Color
                            </p>
                            <div className="flex justify-start items-center">
                              <p className="text-gray-800 text-sm font-semibold w-[60px]">
                                S.no {i + 1}
                              </p>
                              <div className="relative w-full">
                                <input
                                  type="text"
                                  className="w-full md:h-[50px] h-[40px] bg-custom-light border border-custom-offWhite rounded outline-none pl-5 text-black"
                                  value={item.color}
                                  onChange={(e) => {
                                    setvarients(
                                      produce((draft) => {
                                        draft[i].color = e.target.value;
                                      })
                                    );
                                  }}

                                />
                                <p
                                  className=" md:w-5 w-3 md:h-5 h-3 rounded-full absolute top-[13px] right-[10px] cursor-pointer border border-black"
                                  style={{ backgroundColor: item.color }}
                                  onClick={() => {
                                    setOpenPopup(true);
                                    setCurrentIndex(i);
                                  }}
                                ></p>
                                <Dialog
                                  open={openPopup}
                                  onClose={handleClose}
                                  aria-labelledby="draggable-dialog-title"
                                >
                                  <div className="md:w-[400px] w-[330px]">
                                    <DialogTitle
                                      style={{ cursor: "move" }}
                                      id="draggable-dialog-title"
                                    >
                                      <p className="text-black font-bold text-xl text-center">
                                        Color Picker
                                      </p>
                                    </DialogTitle>
                                    <DialogContent>
                                      <ColorPicker
                                        color={color}
                                        onChange={setColor}
                                      />
                                    </DialogContent>
                                    <DialogActions className="!p-0 !flex !justify-center !items-center">
                                      <div className="!flex !justify-center !items-center px-[24px] pb-[24px] w-full gap-3">
                                        <button
                                          className="bg-black h-[45px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
                                          onClick={() => {
                                            setvarients(
                                              produce((draft) => {
                                                draft[i].color = color.hex;
                                              })
                                            );
                                            setvarients(
                                              produce((draft) => {
                                                draft[i].selected.forEach((sel) => {
                                                  sel.attributes?.forEach((attr) => {
                                                    if (attr.label?.toLowerCase() === "color") {
                                                      attr.value = color.hex;
                                                    }
                                                  });
                                                });
                                              })
                                            );
                                            setSelectedColor(color.hex)
                                            setOpenPopup(false);
                                          }}
                                        >
                                          Ok
                                        </button>
                                        <button
                                          className="bg-black h-[45px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
                                          onClick={handleClose}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </DialogActions>
                                  </div>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {item.selected?.map((attrGroup, setIndex) => (
                        <div
                          key={setIndex}
                          className=" mt-4 grid grid-cols-1 gap-4 mb-6 border border-gray-300 p-4 rounded"
                        >
                          <div className=" relative grid md:grid-cols-4 grid-cols-1 gap-4">
                            <IoCloseCircleOutline
                              className="absolute top-0 right-2 text-red-600 text-xl"
                              onClick={() => {
                                setvarients(
                                  produce((draft) => {
                                    draft[i].selected.splice(setIndex, 1);
                                  })
                                );
                              }}
                            />

                            {attrGroup?.attributes?.map((attr, attrIndex) => (

                              <div key={attrIndex}>
                                <p className="text-gray-800 font-semibold mb-1">{attr?.label}</p>
                                <input
                                  type="text"
                                  placeholder="Value"
                                  className="w-full border text-gray-600 border-gray-300 rounded px-4 py-2 mb-2"
                                  value={attr?.value}
                                  onChange={(e) => {
                                    setvarients(
                                      produce((draft) => {
                                        draft[i].selected[setIndex].attributes[attrIndex].value = e.target.value;
                                      })
                                    );
                                  }}
                                  disabled={attr?.value?.toLowerCase() === "color"}
                                />
                              </div>
                            ))}
                          </div>



                          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mt-4">
                            <div>
                              <p className="text-gray-800 font-semibold mb-1">Qty</p>
                              <input
                                type="number"
                                placeholder="Qty"
                                required
                                className="w-full border text-gray-600 border-gray-300 rounded px-4 py-2"
                                value={attrGroup?.qty || ""}
                                onChange={(e) => {
                                  setvarients(
                                    produce((draft) => {
                                      draft[i].selected[setIndex].qty = e.target.value;
                                    })
                                  );
                                }}
                              />
                            </div>

                            <div>
                              <p className="text-gray-800 font-semibold mb-1">Price</p>
                              <input
                                type="number"
                                placeholder="Price"
                                className="w-full border text-gray-600 border-gray-300 rounded px-4 py-2"
                                value={attrGroup?.price || ""}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? "" : Number(e.target.value); // convert to number
                                  setvarients(
                                    produce((draft) => {
                                      draft[i].selected[setIndex].price = value;
                                    })
                                  );
                                }}
                              />

                            </div>

                            <div>
                              <p className="text-gray-800 font-semibold mb-1">Offer Price</p>
                              <input
                                type="number"
                                placeholder="Offer Price"
                                required
                                className="w-full border text-gray-600 border-gray-300 rounded px-4 py-2"
                                value={attrGroup?.offerprice || ""}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? "" : Number(e.target.value);
                                  setvarients(
                                    produce((draft) => {
                                      draft[i].selected[setIndex].offerprice = value;
                                    })
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}


                      {selectedCategory && (
                        <p
                          className="bg-black mt-2 flex justify-center items-center cursor-pointer h-[40px] w-40 rounded-[10px] NunitoSans text-white font-normal text-base"
                          onClick={() => {
                            const newAttrGroup = {
                              attributes: productsData?.Attribute?.map(attr => ({
                                label: attr.name,
                                value: attr.name.toLowerCase() === "color" ? selectedColor || "" : "",
                              })),
                              qty: "",
                              price: "",
                              offerprice: "",
                            };

                            setvarients(
                              produce((draft) => {
                                draft[i].selected.push(newAttrGroup);
                              })
                            );
                          }}

                        >
                          Add More Attributes
                        </p>
                      )}




                      <div className="w-full mt-5">
                        {/* Upload Section */}
                        <div className="relative w-full">
                          <div className="w-full">
                            <p className="text-gray-800 text-lg font-semibold pb-1">Images</p>
                            <div className="border rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                              <input
                                className="outline-none bg-white text-black md:w-[90%] w-[85%]"
                                type="text"
                                placeholder="Carousel Images"
                                value={singleImgs[i] || ""}
                                onChange={(e) => {
                                  const updated = [...singleImgs];
                                  updated[i] = e.target.value;
                                  setSingleImgs(updated);
                                }}
                              />
                            </div>
                          </div>

                          <div className="absolute top-[32px] md:right-[10px] right-[10px]">
                            <MdOutlineFileUpload
                              className="text-black h-8 w-8 cursor-pointer"
                              onClick={() => {
                                fileRefs.current[i]?.click();
                              }}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => (fileRefs.current[i] = el)}
                              className="hidden"
                              onChange={(e) => handleImageChange(e, i)}
                            />
                          </div>
                        </div>


                        {src && (
                          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                            <div className="p-4 bg-white rounded-lg max-w-4xl max-h-[750px] overflow-x-scroll">
                              <ReactCrop
                                crop={crop}
                                onChange={(newCrop) => setCrop(newCrop)}
                                aspect={1}  
                              >
                                <img
                                  id="crop-image"
                                  src={src}
                                  alt="Crop"
                                  className="max-w-3xl max-h-[500px] w-full  object-contain mx-auto overflow-auto"
                                />

                              </ReactCrop>

                              <div className="flex justify-between mt-4">
                                <button
                                  className="px-4 py-2 bg-gray-400 rounded"
                                  onClick={() => setSrc(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="px-4 py-2 bg-black text-white rounded"
                                  onClick={() => handleCropConfirm(i)}
                                >
                                  Confirm Crop
                                </button>

                              </div>
                            </div>
                          </div>
                        )}


                        <div className="flex justify-between items-center mt-5">
                          <p className="text-gray-700">
                            Please Upload image in 500 × 500 size for better UI experience
                          </p>
                          <p
                            className="text-white bg-black rounded-[10px] text-center text-md py-2 w-36 cursor-pointer"
                            onClick={() => {
                              if (!singleImgs[i]) {
                                props.toaster({
                                  type: "error",
                                  message: "Carousel image is required",
                                });
                                return;
                              }

                              setvarients(
                                produce((draft) => {
                                  draft[i].image.push(singleImgs[i]);
                                })
                              );

                              const updated = [...singleImgs];
                              updated[i] = "";
                              setSingleImgs(updated);
                            }}
                          >
                            Add
                          </p>
                        </div>


                        {/* Preview */}
                        <div className="flex md:flex-row flex-wrap md:gap-5 gap-4 mt-5">
                          {item?.image?.map((ig, inx) => (
                            <div className="relative" key={inx}>
                              <img className="md:w-20 w-[85px] h-20 object-contain" src={ig} />
                              <IoCloseCircleOutline
                                className="text-red-700 cursor-pointer h-5 w-5 absolute left-[5px] top-[10px]"
                                onClick={() => {
                                  closeIcon(ig, inx, item?.image, i);
                                }}
                              />
                            </div>
                          ))}
                        </div>

                      </div>

                    </div>
                  </div>
                ))
              }

              <div className="w-full md:mt-5 mt-5 flex justify-end mb-5 gap-2">
                <p
                  className="bg-black flex justify-center items-center cursor-pointer md:h-[45px] h-[40px] md:w-[177px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
                  onClick={() => {
                    const newVariant = {
                      color: "",
                      image: [],
                      selected: [
                        {
                          attributes: productsData?.Attribute?.map(attr => ({
                            label: attr.name,
                            value: "",
                          })),
                          qty: "",
                          price: "",
                          offerprice: ""
                        }
                      ]
                    };
                    setvarients(prev => [...prev, newVariant]);
                    setSingleImgs(prev => [...prev, ""]);
                  }}
                >
                  Add more
                </p>
              </div>


            </div>

            <div className="flex justify-center items-center md:mt-10 mt-5 gap-5">
              <button
                className="bg-black md:h-[45px] h-[40px] w-[177px] rounded-[12px] NunitoSans text-white font-normal text-base"
                type="submit"
              >
                {router.query.id ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Products;
