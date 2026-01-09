"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Camera, Upload, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  onUpload: (file: Blob, fileName: string) => Promise<void>;
  isUploading?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Set canvas size to crop size
  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onUpload,
  isUploading = false,
}: AvatarUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("File size exceeds 2MB limit");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Allowed: JPG, PNG, WebP");
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setIsDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      await onUpload(croppedBlob, "avatar.jpg");
      setIsDialogOpen(false);
      setImageSrc(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to crop image");
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="flex items-center gap-6">
        {/* Avatar Display */}
        <div className="relative group">
          <div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center",
              "bg-primary text-primary-foreground text-2xl font-semibold",
              "border-4 border-background shadow-lg",
              "overflow-hidden"
            )}
          >
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(userName)
            )}
          </div>

          {/* Upload Overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "absolute inset-0 rounded-full flex items-center justify-center",
              "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
              "text-white cursor-pointer",
              isUploading && "opacity-100"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Upload Button */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 2MB.
          </p>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onSelectFile}
          className="hidden"
        />
      </div>

      {/* Crop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Photo</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            {imageSrc && (
              <div className="max-w-full max-h-[400px] overflow-hidden rounded-lg">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </ReactCrop>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpload}
                disabled={!completedCrop || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
