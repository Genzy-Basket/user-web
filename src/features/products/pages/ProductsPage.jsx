import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../../cart/hooks/useCart";
import ProductCard from "../components/ProductCard";

const ProductsPage = () => {
  const {
    products,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    getFilteredProducts,
    getCategories,
  } = useProducts();
  const { cart } = useCart();

  const [showFilters, setShowFilters] = useState(false);
  const filteredProducts = getFilteredProducts();

  // Build card list: one card per in-cart config (with qty ctrl),
  // or one Add card if none are in cart for this product.
  const buildCards = () =>
    filteredProducts.flatMap((product) => {
      // During search, always show one card per product
      if (filters.searchQuery) {
        return [<ProductCard key={product._id} product={product} />];
      }

      const cartItems =
        cart?.items?.filter(
          (item) => (item.productId?._id ?? item.productId) === product._id,
        ) ?? [];

      if (cartItems.length > 0) {
        return cartItems.map((item) => {
          const config = product.priceConfigs.find(
            (c) => c._id === item.priceConfigId,
          );
          return (
            <ProductCard
              key={`${product._id}-${item.priceConfigId}`}
              product={product}
              activeConfig={config}
            />
          );
        });
      }

      return [<ProductCard key={product._id} product={product} />];
    });
  const categories = getCategories();

  const handleCategoryChange = (category) => {
    updateFilters({
      category: category === filters.category ? null : category,
    });
  };

  const handleSearchChange = (e) => {
    updateFilters({ searchQuery: e.target.value });
  };

  const handleAvailableToggle = () => {
    updateFilters({ availableOnly: !filters.availableOnly });
  };

  const hasActiveFilters =
    filters.category || filters.searchQuery || !filters.availableOnly;

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-medium">Loading fresh products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <p className="text-xl font-semibold mb-2">Oops! Something went wrong</p>
        <p className="text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-[#009661] overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
              Fresh <span className="text-emerald-200">Products</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-emerald-50/90 max-w-xl mx-auto font-medium">
              Premium quality vegetables and ingredients,
              <br className="hidden sm:block" /> hand-picked and delivered to
              your doorstep.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-8 md:mt-10 px-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5
                 transition-all duration-300
                 text-[#009661] group-focus-within:text-slate-900 group-focus-within:scale-110"
                />
                <input
                  type="text"
                  placeholder="Search for fresh vegetables..."
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-white pl-14 pr-6 py-4 md:py-5 rounded-2xl text-slate-800 placeholder:text-slate-400
                 outline-none border-none shadow-2xl transition-all duration-300
                 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]
                 focus:ring-4 focus:ring-emerald-400/40 focus:scale-[1.01]
                 text-base md:text-lg font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-[40px]"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              {filters.category ? (
                <span className="capitalize">{filters.category}</span>
              ) : (
                "All Products"
              )}
            </h2>
            <span className="text-sm md:text-base text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {filteredProducts.length}
            </span>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showFilters || hasActiveFilters
                ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                : "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && !showFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 md:p-6 mb-6 shadow-lg animate-slide-down">
            {/* Categories */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilters({ category: null })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    !filters.category
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                      filters.category === category
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Only Toggle */}
            <div className="flex items-center justify-between mb-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={handleAvailableToggle}
                  className="w-5 h-5 rounded cursor-pointer accent-emerald-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  Show available only
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Reset All
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
              No products found
            </h3>
            <p className="text-slate-600 mb-6">
              {filters.searchQuery
                ? `No results for "${filters.searchQuery}"`
                : "Try adjusting your filters"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {buildCards()}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
