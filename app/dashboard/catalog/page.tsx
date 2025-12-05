"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Search, Filter, Store as StoreIcon, Package, Grid, Grid3x3 } from "lucide-react";
import { useTranslations } from "@/contexts/language-context";
import ProductGrid from "@/components/dashboard/catalog/product-grid";
import StoreGrid from "@/components/dashboard/catalog/store-grid";

import { useDebounce } from "@/hooks/use-debounce";

const API_BASE_URL = "https://closetmind.studio";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  image_urls: string[];
  rating: number;
  reviews_count: number;
  stock_quantity: number;
  is_active: boolean;
  discount_percentage: number;
  is_in_stock: boolean;
  store: {
    id: number;
    name: string;
    city: string;
    logo_url: string;
    rating: number;
  };
  created_at: string;
}

import { Store } from "@/lib/types";

interface Filters {
  query: string;
  category: string;
  city: string;
  min_price: string;
  max_price: string;
  min_rating: string;
  in_stock_only: boolean;
  brand: string;
  sizes: string[];
  colors: string[];
  sort_by: string;
  sort_order: string;
}

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  const [filters, setFilters] = useState<Filters>({
    query: "",
    category: "",
    city: "",
    min_price: "",
    max_price: "",
    min_rating: "",
    in_stock_only: false,
    brand: "",
    sizes: [],
    colors: [],
    sort_by: "created_at",
    sort_order: "desc"
  });

  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const fetchProducts = useCallback(async (currentPage = 1, currentFilters = filters, reset = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (currentFilters.query) queryParams.append('query', currentFilters.query);
      if (currentFilters.category) queryParams.append('category', currentFilters.category);
      if (currentFilters.city) queryParams.append('city', currentFilters.city);
      if (currentFilters.min_price) queryParams.append('min_price', currentFilters.min_price);
      if (currentFilters.max_price) queryParams.append('max_price', currentFilters.max_price);
      if (currentFilters.min_rating) queryParams.append('min_rating', currentFilters.min_rating);
      if (currentFilters.in_stock_only) queryParams.append('in_stock_only', 'true');
      if (currentFilters.brand) queryParams.append('brand', currentFilters.brand);
      if (currentFilters.sizes.length > 0) queryParams.append('sizes', currentFilters.sizes.join(','));
      if (currentFilters.colors.length > 0) queryParams.append('colors', currentFilters.colors.join(','));
      if (currentFilters.sort_by) queryParams.append('sort_by', currentFilters.sort_by);
      if (currentFilters.sort_order) queryParams.append('sort_order', currentFilters.sort_order);
      
      queryParams.append('page', currentPage.toString());
      queryParams.append('per_page', '20');

      const res = await fetch(`${API_BASE_URL}/api/v1/products/?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Error loading products");
      
      const data = await res.json();
      
      if (reset || currentPage === 1) {
        setProducts(data.products || []);
      } else {
        setProducts(prev => [...prev, ...(data.products || [])]);
      }
      
      setTotal(data.total || 0);
      setHasMore((data.products || []).length === 20);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStores = useCallback(async (currentPage = 1, currentFilters = filters, reset = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (currentFilters.query) queryParams.append('query', currentFilters.query);
      if (currentFilters.city) queryParams.append('city', currentFilters.city);
      if (currentFilters.min_rating) queryParams.append('rating_min', currentFilters.min_rating);
      if (currentFilters.sort_by) queryParams.append('sort_by', currentFilters.sort_by);
      if (currentFilters.sort_order) queryParams.append('sort_order', currentFilters.sort_order);
      
      queryParams.append('page', currentPage.toString());
      queryParams.append('per_page', '20');

      const res = await fetch(`${API_BASE_URL}/api/v1/stores/?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Error loading stores");
      
      const data = await res.json();
      
      if (reset || currentPage === 1) {
        setStores(data.stores || []);
      } else {
        setStores(prev => [...prev, ...(data.stores || [])]);
      }
      
      setTotal(data.total || 0);
      setHasMore((data.stores || []).length === 20);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update query filter when search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, query: debouncedSearchQuery }));
  }, [debouncedSearchQuery]);

  // Fetch data when filters change
  useEffect(() => {
    setPage(1);
    if (activeTab === "products") {
      fetchProducts(1, filters, true);
    } else {
      fetchStores(1, filters, true);
    }
  }, [filters, activeTab, fetchProducts, fetchStores]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    
    if (activeTab === "products") {
      fetchProducts(nextPage, filters, false);
    } else {
      fetchStores(nextPage, filters, false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: searchQuery,
      category: "",
      city: "",
      min_price: "",
      max_price: "",
      min_rating: "",
      in_stock_only: false,
      brand: "",
      sizes: [],
      colors: [],
      sort_by: "created_at",
      sort_order: "desc"
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-black dark:text-white mx-auto mb-3" />
          <p className="text-base text-gray-600 dark:text-gray-300">{tCommon('buttons.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {tDashboard('catalog.title')}
        </h1>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={tDashboard('catalog.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Filters Toggle and Mobile View Switcher */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled
            className="gap-2 opacity-50 cursor-not-allowed"
          >
            <Filter className="h-4 w-4" />
            {tCommon('common.filter')}
          </Button>
          
          {/* Mobile View Switcher - Only for Products Tab */}
          {activeTab === "products" && (
            <div className="flex items-center gap-1 sm:hidden">
              <Button
                variant={mobileColumns === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setMobileColumns(1)}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={mobileColumns === 2 ? "default" : "outline"}
                size="sm"
                onClick={() => setMobileColumns(2)}
                className="p-2"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {total > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {total} {activeTab === "products" ? tDashboard('catalog.products.title').toLowerCase() : tDashboard('catalog.stores.title').toLowerCase()}
          </span>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            {tDashboard('catalog.tabs.products')}
          </TabsTrigger>
          <TabsTrigger value="stores" className="gap-2">
            <StoreIcon className="h-4 w-4" />
            {tDashboard('catalog.tabs.stores')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <ProductGrid 
            products={products}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            mobileColumns={mobileColumns}
          />
        </TabsContent>

        <TabsContent value="stores" className="mt-6">
          <StoreGrid 
            stores={stores}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 