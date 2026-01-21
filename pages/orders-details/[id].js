import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Api } from "../../services/service";
import {
  MdLocationOn,
  MdLocalShipping,
} from "react-icons/md";

function OrdersDetails(props) {
  const router = useRouter();
  console.log(router);
  const [productsId, setProductsId] = useState({});
  const [selectedImage, setSelectedImage] = useState("");
  const [cartData, setCartData] = useState([]);
  const [selecteSize, setSelecteSize] = useState({});
  const [selectedImageList, setSelectedImageList] = useState([]);
  const [mainProductsData, setMainProductsData] = useState({});
  const [userAddress, setUserAddress] = useState([]);

  useEffect(() => {
    let cart = localStorage.getItem("addCartDetail");
    if (cart) {
      setCartData(JSON.parse(cart));
    }
    if (router?.query?.id) {
      getProductById();
    }
  }, [router?.query?.id]);


  const getProductById = async () => {
    props.loader(true);
    Api("get", `getProductRequest/${router?.query?.id}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setMainProductsData(res?.data);
        const d = res.data.productDetail.find(
          (f) => f._id === router?.query?.product_id
        );
        setProductsId(d);
        const address = res.data.ShippingAddress;
        setUserAddress(address);
        setSelectedImageList(d?.image);
        setSelectedImage(d.image[0]);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  console.log("main product data ::", mainProductsData);

  const imageOnError = (event) => {
    event.currentTarget.src = "/default-product-image.png";
    // event.currentTarget.className = "error";
  };

  const handleBackClick = () => {
    router.push("/orders");
  };
  return (
    <>
      <section className="w-full h-full bg-[#F9F9F9] py-6 px-4 md:px-8 overflow-scroll pb-20">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gray-800 font-bold text-2xl md:text-3xl">
            Order Details
          </h1>
          <button
            className="bg-[#127300] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#127300] transition-colors"
            onClick={handleBackClick}
          >
            Back to Orders
          </button>
        </div>

        {/* Main Content */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:grid md:grid-cols-2 w-full">
            {/* Product Image Gallery */}
            <div className="border-b md:border-b-0 md:border-r border-gray-100">
              <div className="p-6">
                <div className="grid md:grid-cols-5 grid-cols-1 gap-4">
                  {/* Thumbnails */}
                  <div className="flex flex-row md:flex-col md:space-y-4 space-x-3 md:space-x-0 overflow-x-auto md:overflow-y-auto md:h-[400px] pb-4 md:pb-0">
                    {selectedImageList?.map((item, i) => (
                      <div key={i} className="flex-shrink-0">
                        <div
                          className={`cursor-pointer rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 ${selectedImage === item
                            ? "ring-2 ring-[#F38529]"
                            : "ring-1 ring-gray-200"
                            }`}
                          onClick={() => {
                            setSelectedImage(item);
                            imageOnError();
                          }}
                        >
                          <img
                            className="w-20 h-20 md:w-full md:h-24 object-cover"
                            src={item || "/default-product-image.png"}
                            alt="Product thumbnail"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Image */}
                  <div className="col-span-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-[400px]">
                    <img
                      className="max-h-full max-w-full object-contain"
                      src={selectedImage || "/default-product-image.png"}
                      onError={imageOnError}
                      alt="Product main image"
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="p-6 md:p-8">
              <div className="flex flex-col space-y-4">
                <h2 className="text-gray-800 text-2xl md:text-3xl font-semibold">
                  {productsId?.product?.name}
                </h2>

                <div className="flex items-center">
                  <span className="text-[#F38529] text-2xl font-bold">
                    ${selecteSize?.rate || productsId?.price}
                  </span>
                </div>


                <div className="mt-4 space-y-3">
                  {productsId?.color && (
                    <div className="flex items-center">
                      <span className="text-gray-600 w-32">Color:</span>
                      <div className="flex items-center">
                        <span
                          className="w-5 h-5 rounded-full mr-2 border border-gray-300"
                          style={{ backgroundColor: productsId?.color }}
                        ></span>
                        <span className="text-gray-800 font-medium">
                          {productsId?.color}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center mb-2">
                    <span className="text-gray-600 w-32">Quantity:</span>
                    <span className="text-gray-800 font-medium">
                      {productsId?.qty || 0}
                    </span>
                  </div>

                  {productsId?.attribute &&
                    Object.entries(productsId.attribute)
                      .filter(([key]) => key.toLowerCase() !== "color")
                      .map(([label, value], index) => (
                        <div key={index} className="flex items-center mb-2">
                          <span className="text-gray-600 w-32 capitalize">{label}:</span>
                          <span className="text-gray-800 font-medium">{value || "Not found"}</span>
                        </div>
                      ))}

                </div>

                <div className="mt-2">
                  <h3 className="text-gray-800 font-semibold ">
                    Description
                  </h3>
                  <div
                    className="text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: productsId?.product?.long_description,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl mt-8 shadow-sm overflow-hidden">
          <div className="bg-white rounded-xl  p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center text-gray-600">
              <MdLocalShipping className="text-custom-green mr-2" /> Shipping
              Information
            </h3>

            {userAddress ? (
              <div className="flex items-start">
                <MdLocationOn className="text-gray-700 text-xl mt-1 mr-3" />
                <div>
                  <p className="font-medium mb-1 text-gray-600">
                    Delivery Address
                  </p>
                  {userAddress?.Name && (
                    <p className="text-gray-600 mt-2">
                      {userAddress?.Name}
                    </p>
                  )}
                  <p className="text-gray-600">
                    {userAddress?.address}, {userAddress?.city}, {userAddress?.State}, {userAddress?.country},  {userAddress?.pinCode}
                  </p>
                  {userAddress?.phoneNumber && (
                    <p className="text-gray-600">
                      {userAddress?.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No shipping address available</p>
            )}
          </div>
        </section>
      </section>
    </>
  );
}

export default OrdersDetails;
