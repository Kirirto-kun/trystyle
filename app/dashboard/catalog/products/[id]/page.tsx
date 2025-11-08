"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Heart,
  Share2
} from "lucide-react";
import { useTranslations } from "@/contexts/language-context";
import Link from "next/link";
import { generateSlug } from "@/lib/utils";
import ReviewsSection from "@/components/dashboard/catalog/reviews-section";

const API_BASE_URL = "http://localhost:8000";

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
    slug: string;
    city: string;
    logo_url: string;
    rating: number;
  };
  created_at: string;
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<{[key: number]: boolean}>({});

  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const productId = params.id as string;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError(null);
      // Reset image errors when fetching new product
      setMainImageError(false);
      setThumbnailErrors({});
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`);
        if (!res.ok) {
          throw new Error("Product not found");
        }
        
        const data = await res.json();
        setProduct(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Reset main image error when switching images
  useEffect(() => {
    setMainImageError(false);
  }, [selectedImageIndex]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

  if (error || !product) {
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
              {error || "Product not found"}
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

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              {product.image_urls && product.image_urls.length > 0 && !mainImageError ? (
                <img
                  src={product.image_urls[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setMainImageError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.image_urls.map((image, index) => (
                  !thumbnailErrors[index] && (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg border-2 transition-colors ${
                        selectedImageIndex === index
                          ? 'border-black dark:border-white'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => setThumbnailErrors(prev => ({...prev, [index]: true}))}
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                {product.discount_percentage > 0 && (
                  <Badge className="bg-red-500 text-white">
                    -{product.discount_percentage}%
                  </Badge>
                )}

              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {product.brand}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.rating.toFixed(1)} ({product.reviews_count} {tDashboard('catalog.reviews.title').toLowerCase()})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.original_price > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Sizes and Colors */}
            <div className="space-y-4">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {tDashboard('catalog.products.sizes')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Badge key={size} variant="outline">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {tDashboard('catalog.products.colors')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Badge key={color} variant="outline" className="capitalize">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                {tDashboard('catalog.products.addToWishlist')}
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Store Information */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {product.store.logo_url ? (
                    <img
                      src={product.store.logo_url}
                      alt={`${product.store.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <StoreIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {product.store.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {product.store.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      {product.store.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                
                <Link href={`/${(product.store.slug && product.store.slug.trim()) || generateSlug(product.store.name)}`}>
                  <Button variant="outline" size="sm">
                    {tDashboard('catalog.stores.viewStore')}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">{tDashboard('catalog.products.description')}</TabsTrigger>
            <TabsTrigger value="reviews">{tDashboard('catalog.reviews.title')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <ReviewsSection productId={product.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 