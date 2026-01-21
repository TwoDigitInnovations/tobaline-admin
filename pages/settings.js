import React, { useState, useRef, useEffect } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { useRouter } from "next/router";
import { IoCloseCircleOutline } from "react-icons/io5";
import { Api, ApiFormData } from "../services/service";
import isAuth from "../components/isAuth";
import Compressor from "compressorjs";

function Settings(props) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const instaFileRef = useRef(null);
  const [instaImage, setInstaImage] = useState([]);
  const [singleInstaImg, setSingleInstaImg] = useState("");
  const [inputValue, setInputValue] = useState("");
  const selectRef = useRef(null);

  useEffect(() => {
    getInstaImage();
  }, []);

  const handleInstaImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileSizeInMb = file.size / (1024 * 1024);
    if (fileSizeInMb > 5) {
      props.toaster({
        type: "error",
        message: "Too large file. Please upload a smaller image",
      });
      return;
    } else {
      new Compressor(file, {
        quality: 0.6,
        success: (compressedResult) => {
          console.log(compressedResult);
          const data = new FormData();
          data.append("file", compressedResult);
          props.loader(true);
          ApiFormData("post", "user/fileupload", data, router).then(
            (res) => {
              props.loader(false);

              if (res.status) {
                setSingleInstaImg(res.data.fileUrl);
                props.toaster({ type: "success", message: res.data.message });
              }
            },
            (err) => {
              props.loader(false);
              console.log(err);
              props.toaster({ type: "error", message: err?.message });
            },
          );
        },
      });
    }
  };

  const Imagesubmit = (e) => {
    e.preventDefault();

    props.loader(true);
    let data = {
      image: instaImage,
    };

    Api("post", `createOrUpdateInstaImage`, data, router).then(
      (res) => {
        props.loader(false);
        if (res?.success) {
          setSubmitted(false);
          console.log(res.data);
          setInstaImage(res?.data?.image || []);
          props.toaster({ type: "success", message: res?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
      },
    );
  };

  const getInstaImage = async () => {
    props.loader(true);
    Api("get", "getInstaImage", "", router).then(
      (res) => {
        props.loader(false);

        if (res?.success) {
          setInstaImage(res.InstaImage[0]?.image || []);
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      },
    );
  };

  const closeInstaIcon = (item) => {
    const filteredImages = instaImage.filter((f) => f.image !== item.image);
    setInstaImage(filteredImages);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <section className="w-full bg-gray-50 md:p-8 p-4 h-[90vh] overflow-y-scroll scrollbar-hide overflow-scroll pb-32">
        <div className="mb-8">
          <h2 className="text-gray-800 font-bold md:text-3xl text-xl mb-4 flex items-center">
            <span className="w-1 h-8 bg-[#F38529] rounded mr-3"></span>
            HomePage Instagram Follow Section Image
          </h2>

          <section className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <form className="w-full" onSubmit={Imagesubmit}>
              <div className="space-y-6">
                <div className="relative w-full">
                  <label className="text-gray-700 text-lg font-medium mb-2 block">
                    Instagram Images
                  </label>
                  <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                    <input
                      className="outline-none bg-transparent w-full text-gray-700"
                      type="text"
                      placeholder="Enter image URL"
                      value={singleInstaImg}
                      onChange={(text) => {
                        setSingleInstaImg(text.target.value);
                      }}
                    />
                    <div
                      className="ml-2 cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors"
                      onClick={() => {
                        instaFileRef.current.click();
                      }}
                    >
                      <MdOutlineFileUpload className="text-gray-700 h-6 w-6" />
                    </div>
                    <input
                      type="file"
                      ref={instaFileRef}
                      className="hidden"
                      onChange={handleInstaImageChange}
                    />
                  </div>
                  {submitted && instaImage.length === 0 && (
                    <p className="text-red-600 mt-1 text-sm">
                      Instagram image is required
                    </p>
                  )}
                </div>

                {/* Add Button */}
                <div className="flex justify-between items-end gap-4">
                  <p className="text-gray-800 text-[14px] md:text-[16px]">
                    Please upload the image in 308x256 resolution. This ensures
                    it looks great on both mobile and website views.
                  </p>
                  <button
                    type="button"
                    className="text-white bg-[#127300] hover:bg-green-600 transition-colors rounded-lg text-md py-2.5 px-6 font-medium shadow-sm"
                    onClick={() => {
                      if (singleInstaImg === "") {
                        props.toaster({
                          type: "error",
                          message: "Instagram Images is required",
                        });
                        return;
                      }
                      setInstaImage([...instaImage, { image: singleInstaImg }]);
                      setSingleInstaImg("");
                      setInputValue("");
                    }}
                  >
                    Add Instagram Image
                  </button>
                </div>

                {/* Instagram Image Preview */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {instaImage?.map((item, i) => (
                    <div key={i} className="relative group">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img
                          className="max-w-full max-h-full object-contain"
                          src={item.image}
                          alt="Instagram preview"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-90 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          closeInstaIcon(item);
                        }}
                      >
                        <IoCloseCircleOutline className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="text-white bg-[#127300] hover:bg-green-600 transition-colors rounded-lg text-md font-medium py-2.5 px-6 shadow-sm"
                  >
                    Submit Instagram Images
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </section>
    </>
  );
}

export default isAuth(Settings);
