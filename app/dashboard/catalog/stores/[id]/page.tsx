"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

export default function StoreDetailPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuth();

  const storeId = params.id as string;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchStoreAndRedirect = async () => {
      if (!storeId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch store details to get slug for redirect
        const storeRes = await fetch(`${API_BASE_URL}/api/v1/stores/${storeId}`);
        if (!storeRes.ok) {
          throw new Error("Store not found");
        }
        const storeData = await storeRes.json();
        
        // Redirect to new beautiful URL
        router.replace(`/${storeData.slug}`);
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchStoreAndRedirect();
  }, [storeId, router]);

  // This page now only redirects to the new beautiful URL

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-black dark:text-white mx-auto mb-3" />
          <p className="text-base text-gray-600 dark:text-gray-300">Redirecting to store page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard/catalog")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Button>
          
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Store Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={() => router.push("/dashboard/catalog")} variant="outline">
              Back to Catalog
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // This should not render as we redirect immediately
  return null;
} 