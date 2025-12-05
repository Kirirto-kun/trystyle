"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useParams } from "next/navigation";
import { 
  Star, 
  MapPin, 
  Store as StoreIcon, 
  Loader2, 
  AlertTriangle,
  ExternalLink,
  Package,
  Grid,
  Grid3x3
} from "lucide-react";

import ProductGrid from "@/components/dashboard/catalog/product-grid";
import { Store } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";
import { generateSlug } from "@/lib/utils";

const API_BASE_URL = "https://closetmind.studio";

interface StoreStats {
  id: number;
  name: string;
  city: string;
  total_products: number;
  active_products: number;
  average_rating: number;
  total_reviews: number;
  categories_count: number;
  top_categories: string[];
}

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

export default function StoreSlugPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);
  
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
  const params = useParams();

  const storeSlug = params.storeSlug as string;

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeSlug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch store details by slug first
        let storeData = null;
        let storeRes = await fetch(`${API_BASE_URL}/api/v1/stores/by-slug/${storeSlug}`);
        
                 if (storeRes.ok) {
           storeData = await storeRes.json();
           console.log('Store data from by-slug:', storeData);
           
           // Check if by-slug returned empty object
           if (!storeData || Object.keys(storeData).length === 0 || !storeData.id) {
             console.log('by-slug returned empty data, trying fallback...');
             storeData = null;
           }
         }
         
         if (!storeData) {
           // Fallback: search through all stores to find matching slug
           console.log('Trying fallback search...');
           const allStoresRes = await fetch(`${API_BASE_URL}/api/v1/stores/`);
           if (allStoresRes.ok) {
             const allStoresData = await allStoresRes.json();
             const stores = allStoresData.stores || allStoresData;
             
             // Find store by matching name or generated slug
             const foundStore = stores.find((store: any) => {
               // Try exact name match first
               if (store.name && store.name.toLowerCase() === storeSlug.toLowerCase()) {
                 return true;
               }
               
               // Try generated slug match using proper generateSlug function
               const generatedSlug = store.name ? generateSlug(store.name) : '';
               return generatedSlug === storeSlug;
             });
             
             if (foundStore) {
               storeData = foundStore;
               console.log('Found store via fallback:', storeData);
             }
           }
         }

        if (!storeData) {
          throw new Error("Store not found");
        }

        // Ensure we have an ID
        if (!storeData.id) {
          console.error('Store data missing ID:', storeData);
          throw new Error("Store data is invalid");
        }

        setStore(storeData);

        // Fetch store statistics using store ID
        const statsRes = await fetch(`${API_BASE_URL}/api/v1/stores/${storeData.id}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStoreStats(statsData);
        }
      } catch (e: any) {
        console.error('Error fetching store:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeSlug]);

  const fetchProducts = async (currentPage = 1, currentFilters = filters, reset = false) => {
    if (!store) return;
    
    setProductsLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (currentFilters.query) queryParams.append('query', currentFilters.query);
      if (currentFilters.category) queryParams.append('category', currentFilters.category);
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

      const res = await fetch(`${API_BASE_URL}/api/v1/stores/${store.id}/products?${queryParams.toString()}`);
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
      console.error('Error fetching products:', e);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (store) {
      setPage(1);
      fetchProducts(1, filters, true);
    }
  }, [filters, store]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, filters, false);
  };

  const handleFiltersChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
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
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-black dark:text-white mx-auto mb-3" />
          <p className="text-base text-gray-600 dark:text-gray-300">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="container flex h-16 items-center justify-between px-4 max-w-6xl mx-auto">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img src="/logo.jpeg" alt="TryStyle Logo" className="h-8 w-8 rounded-md object-cover" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  TryStyle
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="ghost" size="icon" showText={false} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Магазин не найден
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Магазин не найден"}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              На главную
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img src="/logo.jpeg" alt="TryStyle Logo" className="h-8 w-8 rounded-md object-cover" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                TryStyle
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="ghost" size="icon" showText={false} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6">

        {/* Store Header */}
        <Card className="p-6 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Store Logo */}
            <div className="flex-shrink-0">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={`${store.name} logo`}
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <StoreIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {/* Store Information */}
            <div className="flex-1 space-y-4">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {store.name}
                </h1>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {store.city}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(store.rating)}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {store.rating.toFixed(1)}
                    </span>
                  </div>
                  
                  <Badge variant="outline">
                    {store.total_products} товаров
                  </Badge>
                </div>
              </div>

              {/* Description */}
              {store.description && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {store.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {store.website_url && (
                  <Button
                    onClick={() => window.open(store.website_url, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Сайт магазина
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>





        {/* Products Section */}
        <div className="w-full">
          <Tabs defaultValue="products" className="w-full">
            <div className="mx-auto max-w-7xl mb-6">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="products" className="gap-2">
                  <Package className="h-4 w-4" />
                  Товары
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="products" className="space-y-6">
              
              {/* Filters Toggle and Mobile View Switcher */}
              <div className="flex justify-between items-center mx-auto max-w-7xl">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    disabled
                    className="gap-2 opacity-50 cursor-not-allowed"
                  >
                    <Package className="h-4 w-4" />
                    Фильтры
                  </Button>
                  
                  {/* Mobile View Switcher */}
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
                </div>
                
                {/* Product Count */}
                {total > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {total} товаров
                  </span>
                )}
              </div>

              {/* Products Grid */}
              <ProductGrid 
                products={products}
                loading={productsLoading}
                error={null}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                mobileColumns={mobileColumns}
                storeSlug={storeSlug}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 