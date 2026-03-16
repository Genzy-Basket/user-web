import { useMemo } from "react";
import { Search } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../../cart/hooks/useCart";
import ProductCard from "../components/ProductCard";
import Skeleton from "../../../components/Skeleton";

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

  const filteredProducts = getFilteredProducts();

  // Build card list: one card per in-cart config (with qty ctrl),
  // or one Add card if none are in cart for this product.
  const cards = useMemo(
    () =>
      filteredProducts.flatMap((product) => {
        if (filters.searchQuery) {
          return [<ProductCard key={product._id} product={product} />];
        }

        const cartItems =
          cart?.items?.filter(
            (item) =>
              (item.productId?._id ?? item.productId)?.toString() ===
              product._id?.toString(),
          ) ?? [];

        if (cartItems.length > 0) {
          return cartItems.map((item) => {
            const config = product.priceConfigs.find(
              (c) => c._id?.toString() === item.priceConfigId?.toString(),
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
      }),
    [filteredProducts, filters.searchQuery, cart],
  );

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
      <div className="min-h-screen">
        <div className="bg-brand py-6 md:py-12 pb-10 rounded-b-[40px]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Skeleton className="h-10 w-64 mx-auto mb-3 bg-white/20 rounded-xl" />
            <Skeleton className="h-5 w-80 mx-auto mb-6 bg-white/15 rounded-lg" />
            <Skeleton className="h-14 max-w-xl mx-auto bg-white/20 rounded-2xl" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-2 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-3"
              >
                <Skeleton className="w-full aspect-square rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
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
      {/* ── Desktop Hero Section (hidden on mobile) ──────────────────── */}
      <div className="hidden md:block relative bg-brand overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
              Fresh <span className="text-emerald-200">Products</span>
            </h1>
            <p className="text-base md:text-lg text-emerald-50/90 max-w-xl mx-auto font-medium">
              Premium quality vegetables and ingredients,
              <br /> hand-picked and delivered to your doorstep.
            </p>
          </div>

          <div className="max-w-xl mx-auto px-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 text-brand group-focus-within:text-slate-900 group-focus-within:scale-110" />
                <input
                  type="text"
                  placeholder="Search for fresh vegetables..."
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl text-slate-800 placeholder:text-slate-400 outline-none border-none shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] focus:ring-4 focus:ring-emerald-400/40 focus:scale-[1.01] text-base font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-[40px]"></div>
      </div>

      {/* ── Mobile Search Bar + Categories (sticky, matches user-app) ── */}
      <div className="md:hidden sticky top-0 z-30">
        <div
          className="bg-brand px-4 pb-2.5"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.625rem)" }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand" />
            <input
              type="text"
              placeholder="Search products…"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white pl-10 pr-4 h-10 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none border-none font-medium shadow-sm"
            />
            {filters.searchQuery && (
              <button
                onClick={() => updateFilters({ searchQuery: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div
          className="flex gap-2 overflow-x-auto px-4 py-2.5 bg-white border-b border-slate-100 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <button
            onClick={() => updateFilters({ category: null })}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              !filters.category
                ? "bg-brand text-white border-brand shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold capitalize border transition-all ${
                filters.category === category
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Category chips — desktop only */}
        <div
          className="hidden md:flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <button
            onClick={() => updateFilters({ category: null })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              !filters.category
                ? "bg-brand text-white border-brand shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold capitalize border transition-all ${
                filters.category === category
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-4">
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

          <button
            onClick={handleAvailableToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
              filters.availableOnly
                ? "bg-brand text-white border-brand"
                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${filters.availableOnly ? "bg-white" : "bg-slate-400"}`}
            />
            In Stock
          </button>
        </div>

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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20 md:pb-0">
            {cards}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
