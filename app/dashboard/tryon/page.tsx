"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, AlertTriangle, Trash } from "lucide-react";

const API_BASE_URL = "https://www.closetmind.studio";

interface TryOn {
  id: number;
  user_id: number;
  clothing_image_url: string;
  human_image_url: string;
  result_url: string;
  created_at: string;
}

export default function TryOnPage() {
  const [clothingFile, setClothingFile] = useState<File | null>(null);
  const [humanFile, setHumanFile] = useState<File | null>(null);
  const [clothingFilePreview, setClothingFilePreview] = useState<string | null>(null);
  const [humanFilePreview, setHumanFilePreview] = useState<string | null>(null);
  const [tryons, setTryons] = useState<TryOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpen(true);
  };

  const fetchTryons = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/tryon/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error loading try-on history");
      const data = await res.json();
      setTryons(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!humanFile) {
      setHumanFilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(humanFile);
    setHumanFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [humanFile]);

  useEffect(() => {
    if (!clothingFile) {
      setClothingFilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(clothingFile);
    setClothingFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [clothingFile]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (token) fetchTryons(token);
  }, [isAuthenticated, isLoading, token, router, fetchTryons]);

  useEffect(() => {
    if (tryons.some((t) => !t.result_url)) {
      const timer = setTimeout(() => {
        if (token) {
          fetchTryons(token);
        }
      }, 40000);
      return () => clearTimeout(timer);
    }
  }, [tryons, token, fetchTryons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothingFile || !humanFile || !token) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("clothing_image", clothingFile);
      formData.append("human_image", humanFile);

      const res = await fetch(`${API_BASE_URL}/tryon/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Error creating try-on");
      await fetchTryons(token);
      setClothingFile(null);
      setHumanFile(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tryonId: number) => {
    if (!token) return;

    const originalTryons = tryons;
    setTryons(tryons.filter((tryon) => tryon.id !== tryonId));
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/tryon/${tryonId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Error deleting try-on");
      }
    } catch (e: any) {
      setError(e.message);
      setTryons(originalTryons);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Try-On: Clothing Fitting</h1>
      
      <Card className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="human" className="text-base font-medium">Photo of person</Label>
              {humanFilePreview && (
                <div 
                  className="aspect-square rounded-lg overflow-hidden border cursor-pointer"
                  onClick={() => openImageDialog(humanFilePreview)}
                >
                  <img src={humanFilePreview} alt="Preview of person's photo" className="w-full h-full object-cover transition hover:scale-105" />
                </div>
              )}
              <Input
                id="human"
                type="file"
                accept="image/*"
                onChange={e => setHumanFile(e.target.files?.[0] || null)}
                required
                className="file:text-primary file:font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clothing" className="text-base font-medium">Photo of clothing</Label>
              {clothingFilePreview && (
                <div 
                  className="aspect-square rounded-lg overflow-hidden border cursor-pointer"
                  onClick={() => openImageDialog(clothingFilePreview)}
                >
                  <img src={clothingFilePreview} alt="Preview of clothing photo" className="w-full h-full object-cover transition hover:scale-105" />
                </div>
              )}
              <Input
                id="clothing"
                type="file"
                accept="image/*"
                onChange={e => setClothingFile(e.target.files?.[0] || null)}
                required
                className="file:text-primary file:font-semibold"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || !clothingFile || !humanFile}
            className="w-full md:w-auto h-12 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Create try-on"
            )}
          </Button>
          
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </form>
      </Card>

      <div>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">My try-ons</h2>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-base">Loading...</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tryons.map(tryon => (
            <Card key={tryon.id} className="p-4 space-y-4">
              <div className="flex gap-2 justify-center">
                <img 
                  src={tryon.human_image_url} 
                  alt="Person" 
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded border cursor-pointer transition hover:scale-105"
                  onClick={() => openImageDialog(tryon.human_image_url)}
                />
                <img 
                  src={tryon.clothing_image_url} 
                  alt="Clothing" 
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded border cursor-pointer transition hover:scale-105"
                  onClick={() => openImageDialog(tryon.clothing_image_url)}
                />
              </div>
              
              <div className="flex justify-center">
                <div className="relative w-32 h-32 md:w-40 md:h-40 object-cover rounded border flex items-center justify-center bg-muted/20">
                  {tryon.result_url ? (
                    <img
                      src={tryon.result_url}
                      alt="Result"
                      className="w-full h-full object-cover rounded cursor-pointer transition hover:scale-105"
                      onClick={() => openImageDialog(tryon.result_url)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center text-muted-foreground p-2">
                      <Loader2 className="h-6 w-6 md:h-8 md:h-8 animate-spin" />
                      <span className="text-xs mt-2">Processing...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                {new Date(tryon.created_at).toLocaleString()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(tryon.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {tryons.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No try-ons</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl flex flex-col items-center">
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Try-on full" 
              className="max-h-[80vh] w-auto rounded shadow-lg" 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}