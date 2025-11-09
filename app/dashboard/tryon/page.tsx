"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2, AlertTriangle, Trash, User, Shirt, Upload, Camera } from "lucide-react";
import { getImageDimensions, type ImageDimensions } from "@/lib/image-utils";
import { useTranslations } from "@/contexts/language-context";

const API_BASE_URL = "https://closetmind.studio";

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
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentTryon, setCurrentTryon] = useState<TryOn | null>(null);
  const [humanImageDimensions, setHumanImageDimensions] = useState<ImageDimensions | null>(null);
  const [isLoadingDimensions, setIsLoadingDimensions] = useState(false);
  
  // New drag states for enhanced UX
  const [humanDragActive, setHumanDragActive] = useState(false);
  const [clothingDragActive, setClothingDragActive] = useState(false);
  
  // File input refs for programmatic access
  const humanFileInputRef = useRef<HTMLInputElement>(null);
  const clothingFileInputRef = useRef<HTMLInputElement>(null);

  const openImageDialog = async (imageUrl: string, tryon?: TryOn, imageType?: 'human' | 'clothing' | 'result') => {
    setSelectedImage(imageUrl);
    setCurrentTryon(tryon || null);
    setOpen(true);
    
    // Сбрасываем состояния
    setHumanImageDimensions(null);
    setIsLoadingDimensions(false);
    
    // Только для результатов try-on загружаем размеры оригинала человека
    if (tryon && imageType === 'result') {
      setIsLoadingDimensions(true);
      try {
        const humanDimensions = await getImageDimensions(tryon.human_image_url);
        setHumanImageDimensions(humanDimensions);
      } catch (error) {
        console.error('Error loading human image dimensions:', error);
      }
      setIsLoadingDimensions(false);
    }
  };

  // Enhanced drag and drop handlers
  const handleHumanDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setHumanDragActive(true);
  };

  const handleHumanDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setHumanDragActive(false);
  };

  const handleHumanDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setHumanDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setHumanFile(files[0]);
    }
  };

  const handleClothingDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setClothingDragActive(true);
  };

  const handleClothingDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setClothingDragActive(false);
  };

  const handleClothingDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setClothingDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setClothingFile(files[0]);
    }
  };

  const handleHumanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log('Human file selected:', file?.name, file?.size);
    setHumanFile(file);
  };

  const handleClothingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log('Clothing file selected:', file?.name, file?.size);
    setClothingFile(file);
  };

  // Enhanced ImageUploadArea component
  const ImageUploadArea = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    file, 
    preview, 
    dragActive, 
    onDragOver, 
    onDragLeave, 
    onDrop, 
    onClick, 
    inputRef, 
    onChange,
    dragText,
    dropText,
    formatsText,
    changeText
  }: {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    file: File | null;
    preview: string | null;
    dragActive: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onClick: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dragText: string;
    dropText: string;
    formatsText: string;
    changeText: string;
  }) => {
         return (
       <div className="space-y-3 w-80 mx-auto">
         <div className="text-center">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 h-10 flex items-center justify-center">{subtitle}</p>
         </div>
         
         <div
           className={`
             relative h-[400px] w-full rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
            ${dragActive 
              ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${preview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}
          `}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClick}
        >
                     {preview ? (
             // Image preview state
             <div className="relative w-full h-[400px] group">
               <img
                 src={preview}
                 alt={`Preview of ${title.toLowerCase()}`}
                 className="w-full h-full object-cover rounded-lg"
                 onClick={(e) => {
                   e.stopPropagation();
                   openImageDialog(preview, undefined, title.includes('Person') ? 'human' : 'clothing');
                 }}
               />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center">
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                   <Button
                     variant="secondary"
                     size="sm"
                     className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
                     onClick={(e) => {
                       e.stopPropagation();
                       onClick();
                     }}
                   >
                     <Camera className="w-4 h-4 mr-2" />
                     {changeText}
                   </Button>
                 </div>
               </div>
             </div>
                     ) : (
             // Empty state
             <div className="flex flex-col items-center justify-center h-[400px] p-6">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
                ${dragActive 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}>
                <Icon className="w-8 h-8" />
              </div>
              
                             <p className="text-base font-medium text-gray-900 dark:text-white mb-2">
                 {dragActive ? dropText : dragText}
               </p>
               
               <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                 {formatsText}
               </p>
              
              <div className="mt-4">
                <Upload className={`w-5 h-5 mx-auto transition-colors ${
                  dragActive ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`} />
              </div>
            </div>
          )}
          
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onChange}
            className="sr-only"
          />
        </div>
      </div>
    );
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
    console.log('Submit attempt:', { 
      clothingFile: clothingFile?.name, 
      humanFile: humanFile?.name, 
      token: !!token 
    });
    
    if (!clothingFile || !humanFile || !token) {
      console.log('Submit blocked:', { 
        hasClothingFile: !!clothingFile, 
        hasHumanFile: !!humanFile, 
        hasToken: !!token 
      });
      
      // Show specific error message
      if (!humanFile && !clothingFile) {
        setError("Please upload both a person photo and clothing photo");
      } else if (!humanFile) {
        setError("Please upload a person photo");
      } else if (!clothingFile) {
        setError("Please upload a clothing photo");
      } else if (!token) {
        setError("Authentication required. Please refresh the page and try again.");
      }
      return;
    }
    
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
    <div className="space-y-6 md:space-y-8 bg-white dark:bg-gray-900 min-h-screen p-4 md:p-6 overflow-x-hidden">
      <h1 className="text-2xl md:text-3xl font-bold">{tDashboard('tryon.title')}</h1>
      
      <Card className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
            <ImageUploadArea
              title={tDashboard('tryon.upload.person.title')}
              subtitle={tDashboard('tryon.upload.person.subtitle')}
              icon={User}
              file={humanFile}
              preview={humanFilePreview}
              dragActive={humanDragActive}
              onDragOver={handleHumanDragOver}
              onDragLeave={handleHumanDragLeave}
              onDrop={handleHumanDrop}
              onClick={() => humanFileInputRef.current?.click()}
              inputRef={humanFileInputRef}
              onChange={handleHumanFileChange}
              dragText={tDashboard('tryon.upload.person.dragText')}
              dropText={tDashboard('tryon.upload.person.dropText')}
              formatsText={tDashboard('tryon.upload.person.formats')}
              changeText={tDashboard('tryon.upload.person.changeButton')}
            />
            
            <ImageUploadArea
              title={tDashboard('tryon.upload.clothing.title')}
              subtitle={tDashboard('tryon.upload.clothing.subtitle')}
              icon={Shirt}
              file={clothingFile}
              preview={clothingFilePreview}
              dragActive={clothingDragActive}
              onDragOver={handleClothingDragOver}
              onDragLeave={handleClothingDragLeave}
              onDrop={handleClothingDrop}
              onClick={() => clothingFileInputRef.current?.click()}
              inputRef={clothingFileInputRef}
              onChange={handleClothingFileChange}
              dragText={tDashboard('tryon.upload.clothing.dragText')}
              dropText={tDashboard('tryon.upload.clothing.dropText')}
              formatsText={tDashboard('tryon.upload.clothing.formats')}
              changeText={tDashboard('tryon.upload.clothing.changeButton')}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || !clothingFile || !humanFile}
            className="w-full md:w-auto h-12 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon('buttons.loading')}
              </>
            ) : (
              tDashboard('tryon.submit')
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
        <h2 className="text-xl md:text-2xl font-semibold mb-4">{tDashboard('tryon.history.title')}</h2>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-base">{tDashboard('tryon.loading')}</p>
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
                  onClick={() => openImageDialog(tryon.human_image_url, tryon, 'human')}
                />
                <img 
                  src={tryon.clothing_image_url} 
                  alt="Clothing" 
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded border cursor-pointer transition hover:scale-105"
                  onClick={() => openImageDialog(tryon.clothing_image_url, tryon, 'clothing')}
                />
              </div>
              
              <div className="flex justify-center">
                <div className="relative w-full max-w-[200px] md:max-w-[250px]">
                  {tryon.result_url ? (
                    <img
                      src={tryon.result_url}
                      alt="Result"
                      className="w-full h-auto object-contain rounded border cursor-pointer transition hover:scale-105"
                      onClick={() => openImageDialog(tryon.result_url, tryon, 'result')}
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded border flex items-center justify-center bg-muted/20">
                      <div className="flex flex-col items-center text-center text-muted-foreground p-2">
                        <Loader2 className="h-6 w-6 md:h-8 md:h-8 animate-spin" />
                        <span className="text-xs mt-2">{tDashboard('tryon.history.processing')}</span>
                      </div>
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
            <p>{tDashboard('tryon.history.empty')}</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setHumanImageDimensions(null);
          setCurrentTryon(null);
          setIsLoadingDimensions(false);
        }
      }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto flex flex-col items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
          <DialogTitle className="sr-only">
            {tDashboard('tryon.dialog.title')}
          </DialogTitle>
          {selectedImage && (
            <div className="relative flex items-center justify-center">
              {isLoadingDimensions ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading original dimensions...</span>
                </div>
              ) : humanImageDimensions && currentTryon && selectedImage === currentTryon.result_url ? (
                // Отображение try-on результата с точными размерами оригинала человека
                (() => {
                  // Вычисляем коэффициент масштабирования чтобы поместить на экран
                  const maxScreenWidth = window.innerWidth * 0.9;
                  const maxScreenHeight = window.innerHeight * 0.8;
                  
                  const scaleX = maxScreenWidth / humanImageDimensions.width;
                  const scaleY = maxScreenHeight / humanImageDimensions.height;
                  const scale = Math.min(scaleX, scaleY, 1); // не увеличиваем, только уменьшаем
                  
                  return (
                    <div className="relative">
                      <div
                        className="relative"
                        style={{
                          width: `${humanImageDimensions.width}px`,
                          height: `${humanImageDimensions.height}px`,
                          transform: `scale(${scale})`,
                          transformOrigin: 'center center'
                        }}
                      >
                        <img 
                          src={selectedImage} 
                          alt="Try-on result in exact original human dimensions" 
                          className="rounded border shadow-lg"
                          style={{
                            width: `${humanImageDimensions.width}px`,
                            height: `${humanImageDimensions.height}px`,
                            objectFit: 'fill',
                            display: 'block'
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Original: {humanImageDimensions.width}×{humanImageDimensions.height}px
                          {scale < 1 && (
                            <div>Scaled: {Math.round(scale * 100)}%</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Отображение обычных изображений с ограничениями
                <img 
                  src={selectedImage} 
                  alt="Full image" 
                  className="rounded border shadow-lg"
                  style={{ 
                    maxHeight: '80vh', 
                    maxWidth: '90vw', 
                    width: 'auto', 
                    height: 'auto' 
                  }}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}