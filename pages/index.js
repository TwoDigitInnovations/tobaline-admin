import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Api } from '../services/service';
import { Users, DollarSign, BarChart2, HelpCircle, TrendingUp, Package, ShoppingCart, AlertTriangle, Layers } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Tooltip as RechartsTooltip
} from "recharts";

import isAuth from '../components/isAuth';
import { userContext } from './_app';
import ModernStatsCard from '../components/modernstatcard';
import constant from '../services/constant';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

function Home(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [AllData, setAllData] = useState({});
  const [productList, setProductList] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [timeRange, setTimeRange] = useState("monthly");
  const [salesData, setSalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Generate years dynamically
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const [topSellingProducts, setTopSellingProducts] = useState([
    {
      name: "",
      sold: "",
      remaining: "",
    },
  ]);

  useEffect(() => {
    TopSoldProduct();
    dashboarddetails();
    getLowStockProduct();
  }, []);

  const dashboarddetails = async () => {
    props.loader(true);
    Api("get", "product/dashboarddetails", "", router).then(
      (res) => {
        console.log("res================>", res);
        props.loader(false);
        if (res?.status) {
          setAllData(res?.data);
        } else {
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  useEffect(() => {
    const getMonthlySales = async () => {
      props.loader(true);
      Api("get", `product/getMonthlySales?year=${selectedYear}`, "", router).then(
        (res) => {
          console.log("res================>", res);
          props.loader(false);
          if (res?.status) {
            setSalesData(res?.data);
          } else {
            console.log(res?.data?.message);
            props.toaster({ type: "error", message: res?.data?.message });
          }
        },
        (err) => {
          props.loader(false);
          console.log(err);
          props.toaster({ type: "error", message: err?.data?.message });
          props.toaster({ type: "error", message: err?.message });
        }
      );
    };
    getMonthlySales();
  }, [selectedYear]);

  const TopSoldProduct = (page = 1, limit = 8) => {
    props.loader(true);
    Api(
      "get",
      `product/getTopSoldProduct?page=${page}&limit=${limit}`,
      null,
      router
    ).then(
      (res) => {
        props.loader(false);
        if (res.data && Array.isArray(res.data)) {
          setProductList(res.data);

          const mappedData = res.data.map((product) => ({
            name: product.name || "",
            sold: product.sold_pieces || "",
            remaining: product.Quantity || "",
          }));

          setTopSellingProducts(mappedData);
        } else {
          console.error("Unexpected response format:", res);
          props.toaster({
            type: "error",
            message: "Unexpected response format",
          });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getLowStockProduct = (page = 1, limit = 5) => {
    props.loader(true);
    Api(
      "get",
      `product/getLowStockProduct?page=${page}&limit=${limit}`,
      null,
      router
    ).then(
      (res) => {
        props.loader(false);
        if (res.data && Array.isArray(res.data)) {
          setLowStock(res.data);
        } else {
          console.error("Unexpected response format:", res);
          props.toaster({
            type: "error",
            message: "Unexpected response format",
          });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const COLORS = ['#FE4F01', '#127300', '#1a1a1a', '#FFC107'];

  return (
    <section className="min-h-screen bg-gray-50 p-4 md:p-6 h-full overflow-y-scroll scrollbar-hide overflow-scroll md:pb-24 pb-24 ">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#e5e5e5]/5 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-1.5 h-12 bg-black rounded-full mr-4"></div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                  Analytics <span className="text-black">Hub</span>
                </h1>
              </div>
              <p className="text-gray-600 text-lg font-medium">
                Transform your business with intelligent insights
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-gray-100 rounded-2xl px-6 py-3 border border-gray-200">
                <div className="text-black font-bold text-sm">LIVE STATUS</div>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-[#e5e5e5] rounded-full mr-2"></div>
                  <span className="text-gray-700 text-sm">All Systems Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernStatsCard
            title="Active Users"
            value={AllData?.totalUsers || "1,247"}
            icon={<Users size={28} />}
            accentColor="#000"

          />
          <ModernStatsCard
            title="Categories"
            value={AllData?.totalCategories || "89"}
            icon={<Layers size={28} />}
            accentColor="#000"

          />
          <ModernStatsCard
            title="Revenue"
            value={`${constant.currency}${AllData?.totalTransactionAmount || "89,420"}`}
            icon={<DollarSign size={28} />}
            accentColor="#000"

          />
          <ModernStatsCard
            title="Queries"
            value={AllData?.totalFeedbacks || "156"}
            icon={<HelpCircle size={28} />}

            accentColor="#000"

          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
                  <p className="text-gray-500 mt-1">Track your business performance</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FE4F01] focus:border-transparent"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="flex  bg-black rounded-lg">
                    <button className=" text-white px-4 py-2 text-sm font-medium">
                      Monthly
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FE4F01" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FE4F01" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#374151'
                    }}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="monthly"
                    stroke="#FE4F01"
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden md:h-full h-[28rem]">
            <div className="p-6">
              <h2 className="text-xl text-gray-900 font-bold">Product Mix</h2>
              <p className="text-gray-500 mt-1">Top performers</p>
            </div>
            <div className="p-6 md:h-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topSellingProducts.slice(0, 4)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="sold"
                  >
                    {topSellingProducts.slice(0, 4).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [value, "Sold"]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#374151'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {topSellingProducts.slice(0, 4).map((product, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="truncate">{product.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">

          {/* Top Products Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-[#e5e5e5] p-6 text-black">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <TrendingUp className="mr-2" size={24} />
                    Bestsellers
                  </h2>
                  <p className="text-black mt-1">Your top performing products</p>
                </div>
                <div className="bg-black px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-white">Live Data</span>
                </div>
              </div>
            </div>

            <div className="overflow-y-scroll scrollbar-hide overflow-scroll md:h-[36rem] h-[36rem] ">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#127300] uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#127300] uppercase tracking-wider">Sold</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#127300] uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#127300] uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productList.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="font-medium truncate max-w-xs text-gray-900">
                          {product?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#e5e5e5]/10 text-[#127300]">
                          {product?.sold_pieces}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product?.pieces < 10 ? 'bg-black/10 text-black' : 'bg-[#e5e5e5]/10 text-[#127300]'
                          }`}>
                          {product?.pieces}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">
                        ${product?.varients?.[0]?.selected?.[0]?.offerprice || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-black p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <AlertTriangle className="mr-2" size={24} />
                Stock Alert
              </h2>
              <p className="text-gray-100 mt-1">Items running low</p>
            </div>

            <div className="p-6 space-y-4 max-h-full overflow-y-auto">
              {lowStock.map((product, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-shrink-0">
                    <img
                      src={product?.varients?.[0]?.image?.[0]}
                      alt={product?.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/48/48';
                      }}
                    />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {product?.name}
                    </p>
                    <div className="flex items-center mt-1">
                      <Package size={14} className="text-gray-500 mr-1" />
                      <p className="text-xs text-gray-500 font-medium">
                        Only {product?.pieces} left
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-black text-white">
                      LOW
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default isAuth(Home);