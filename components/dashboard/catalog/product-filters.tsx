"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "@/contexts/language-context";

const API_BASE_URL = "https://closetmind.studio";

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

interface Category {
  category: string;
  products_count: number;
  avg_price: number;
  top_brands: string[];
}

interface City {
  city: string;
  stores_count: number;
  products_count: number;
}

interface ProductFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
  activeTab: string;
}

export default function ProductFilters({ filters, onFiltersChange, onClearFilters, activeTab }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [ratingValue, setRatingValue] = useState([1]);

  const tDashboard = useTranslations('dashboard');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/products/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/stores/cities`);
        if (res.ok) {
          const data = await res.json();
          setCities(data.cities || []);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Update price range when filters change
  useEffect(() => {
    const minPrice = filters.min_price ? parseInt(filters.min_price) : 0;
    const maxPrice = filters.max_price ? parseInt(filters.max_price) : 100000;
    setPriceRange([minPrice, maxPrice]);
  }, [filters.min_price, filters.max_price]);

  // Update rating when filters change
  useEffect(() => {
    const rating = filters.min_rating ? parseInt(filters.min_rating) : 1;
    setRatingValue([rating]);
  }, [filters.min_rating]);

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      min_price: values[0].toString(),
      max_price: values[1].toString(),
    });
  };

  const handleRatingChange = (values: number[]) => {
    setRatingValue(values);
    onFiltersChange({
      min_rating: values[0].toString(),
    });
  };

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const commonColors = ['black', 'white', 'gray', 'blue', 'red', 'green', 'yellow', 'pink', 'brown', 'purple'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Category Filter - only for products */}
        {activeTab === "products" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{tDashboard('catalog.filters.category')}</Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => onFiltersChange({ category: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tDashboard('catalog.categories.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{tDashboard('catalog.categories.all')}</SelectItem>
                {loadingCategories ? (
                  <SelectItem value="" disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {tDashboard('catalog.categories.loading')}
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.category} value={category.category}>
                      {category.category} ({category.products_count})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* City Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{tDashboard('catalog.filters.city')}</Label>
          <Select 
            value={filters.city} 
            onValueChange={(value) => onFiltersChange({ city: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={tDashboard('catalog.cities.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{tDashboard('catalog.cities.all')}</SelectItem>
              {loadingCities ? (
                <SelectItem value="" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tDashboard('catalog.cities.loading')}
                </SelectItem>
              ) : (
                cities.map((city) => (
                  <SelectItem key={city.city} value={city.city}>
                    {city.city} ({activeTab === "products" ? city.products_count : city.stores_count})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range - only for products */}
        {activeTab === "products" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{tDashboard('catalog.filters.priceRange')}</Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={100000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{priceRange[0]} ₽</span>
                <span>{priceRange[1]} ₽</span>
              </div>
            </div>
          </div>
        )}

        {/* Rating Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{tDashboard('catalog.filters.rating')}</Label>
          <div className="px-2">
            <Slider
              value={ratingValue}
              onValueChange={handleRatingChange}
              max={5}
              min={1}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 ⭐</span>
              <span>{ratingValue[0]} ⭐</span>
              <span>5 ⭐</span>
            </div>
          </div>
        </div>

        {/* Brand Filter - only for products */}
        {activeTab === "products" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{tDashboard('catalog.filters.brand')}</Label>
            <Input
              placeholder="Nike, Adidas, H&M..."
              value={filters.brand}
              onChange={(e) => onFiltersChange({ brand: e.target.value })}
              className="w-full"
            />
          </div>
        )}

        {/* Sort By */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{tDashboard('catalog.filters.sortBy')}</Label>
          <Select 
            value={filters.sort_by} 
            onValueChange={(value) => onFiltersChange({ sort_by: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">{tDashboard('catalog.filters.sortByDate')}</SelectItem>
              <SelectItem value="name">{tDashboard('catalog.filters.sortByName')}</SelectItem>
              <SelectItem value="rating">{tDashboard('catalog.filters.sortByRating')}</SelectItem>
              {activeTab === "products" && (
                <SelectItem value="price">{tDashboard('catalog.filters.sortByPrice')}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{tDashboard('catalog.filters.sortOrder')}</Label>
          <Select 
            value={filters.sort_order} 
            onValueChange={(value) => onFiltersChange({ sort_order: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{tDashboard('catalog.filters.ascending')}</SelectItem>
              <SelectItem value="desc">{tDashboard('catalog.filters.descending')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Filters for Products */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          


          {/* Sizes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{tDashboard('catalog.filters.sizes')}</Label>
            <div className="flex flex-wrap gap-2">
              {commonSizes.map((size) => (
                <Button
                  key={size}
                  variant={filters.sizes.includes(size) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newSizes = filters.sizes.includes(size)
                      ? filters.sizes.filter(s => s !== size)
                      : [...filters.sizes, size];
                    onFiltersChange({ sizes: newSizes });
                  }}
                  className="h-8 px-3"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{tDashboard('catalog.filters.colors')}</Label>
            <div className="flex flex-wrap gap-2">
              {commonColors.map((color) => (
                <Button
                  key={color}
                  variant={filters.colors.includes(color) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newColors = filters.colors.includes(color)
                      ? filters.colors.filter(c => c !== color)
                      : [...filters.colors, color];
                    onFiltersChange({ colors: newColors });
                  }}
                  className="h-8 px-3 capitalize"
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          {tDashboard('catalog.filters.clearFilters')}
        </Button>
      </div>
    </div>
  );
} 