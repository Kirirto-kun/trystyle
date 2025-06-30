"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { 
  Star, 
  MapPin, 
  Store as StoreIcon, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  ExternalLink,
  Package,
  Users,
  TrendingUp,
  Calendar,
  Grid,
  Grid3x3
} from "lucide-react";
import { useTranslations } from "@/contexts/language-context";
import ProductGrid from "@/components/dashboard/catalog/product-grid";

const API_BASE_URL = "https://www.closetmind.studio";

interface Store {
  id: number;
  name: string;
  description: string;
  city: string;
  logo_url: string;
  website_url: string;
  rating: number;
  total_products: number;
  created_at: string;
  updated_at: string;
}

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

export default function StoreDetailPage() {
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
  const { isAuthenticated, isLoading } = useAuth();
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const storeId = params.id as string;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch store details
        const storeRes = await fetch(`${API_BASE_URL}/api/v1/stores/${storeId}`);
        if (!storeRes.ok) {
          throw new Error("Store not found");
        }
        const storeData = await storeRes.json();
        setStore(storeData);

        // Fetch store statistics
        const statsRes = await fetch(`${API_BASE_URL}/api/v1/stores/${storeId}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStoreStats(statsData);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  const fetchProducts = async (currentPage = 1, currentFilters = filters, reset = false) => {
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

      const res = await fetch(`${API_BASE_URL}/api/v1/stores/${storeId}/products?${queryParams.toString()}`);
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
    if (storeId) {
      setPage(1);
      fetchProducts(1, filters, true);
    }
  }, [filters, storeId]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-black dark:text-white mx-auto mb-3" />
          <p className="text-base text-gray-600 dark:text-gray-300">{tCommon('buttons.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('buttons.back')}
          </Button>
          
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {tCommon('common.error')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Store not found"}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              {tCommon('buttons.tryAgain')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon('buttons.back')}
        </Button>

        {/* Store Header */}
        <Card className="p-6">
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
                    {store.total_products} {tDashboard('catalog.products.title').toLowerCase()}
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
                    {tDashboard('catalog.stores.website')}
                  </Button>
                )}
                
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  С {formatDate(store.created_at)}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Store Statistics */}
        {storeStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-4 text-center">
              <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {storeStats.active_products}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Активных товаров
              </div>
            </Card>

            <Card className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {storeStats.average_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Средний рейтинг
              </div>
            </Card>

            <Card className="p-4 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {storeStats.total_reviews}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Отзывов
              </div>
            </Card>

            <Card className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {storeStats.categories_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Категорий
              </div>
            </Card>
          </div>
        )}

        {/* Top Categories */}
        {storeStats && storeStats.top_categories.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Популярные категории
            </h3>
            <div className="flex flex-wrap gap-2">
              {storeStats.top_categories.map((category) => (
                <Badge key={category} variant="outline" className="px-3 py-1">
                  {category}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Products Section */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              {tDashboard('catalog.products.title')} ({total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6 space-y-6">
            
            {/* Filters Toggle and Mobile View Switcher */}
            <div className="flex justify-between items-center">
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
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 