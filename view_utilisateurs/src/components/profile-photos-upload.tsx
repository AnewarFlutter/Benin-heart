"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, X, CheckCircle, Image as ImageIcon, Camera } from "lucide-react";
import Image from "next/image";

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  status: "completed";
}

interface ProfilePhotosUploadProps {
  onPhotosChange?: (photos: (File | null)[]) => void;
}

export function ProfilePhotosUpload({ onPhotosChange }: ProfilePhotosUploadProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const filePickerRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    filePickerRef.current?.click();
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = 4 - uploadedPhotos.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newPhotos: UploadedPhoto[] = filesToAdd
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => {
        const preview = URL.createObjectURL(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          status: "completed" as const,
        };
      });

    const updatedPhotos = [...uploadedPhotos, ...newPhotos];
    setUploadedPhotos(updatedPhotos);

    // Convert to array format expected by parent
    const photosArray: (File | null)[] = [null, null, null, null];
    updatedPhotos.forEach((photo, index) => {
      if (index < 4) {
        photosArray[index] = photo.file;
      }
    });
    onPhotosChange?.(photosArray);
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addPhotos(event.target.files);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    addPhotos(event.dataTransfer.files);
  };

  const removePhotoById = (id: string) => {
    const updatedPhotos = uploadedPhotos.filter((photo) => photo.id !== id);
    setUploadedPhotos(updatedPhotos);

    // Update parent with new photos array
    const photosArray: (File | null)[] = [null, null, null, null];
    updatedPhotos.forEach((photo, index) => {
      if (index < 4) {
        photosArray[index] = photo.file;
      }
    });
    onPhotosChange?.(photosArray);

    // Cleanup preview URL
    const photoToRemove = uploadedPhotos.find((p) => p.id === id);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
  };

  const canAddMore = uploadedPhotos.length < 4;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Upload Zone */}
      <Card
        className={`group flex max-h-[200px] w-full flex-col items-center justify-center gap-4 py-8 px-6 border-2 border-dotted transition-colors ${
          canAddMore ? "cursor-pointer hover:bg-muted/50" : "bg-muted/30 cursor-not-allowed"
        }`}
        onDragOver={canAddMore ? onDragOver : undefined}
        onDrop={canAddMore ? onDropFiles : undefined}
        onClick={canAddMore ? openFilePicker : undefined}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`flex items-center gap-x-2 ${canAddMore ? "text-muted-foreground" : "text-foreground/60"}`}>
            <Upload className="size-5 shrink-0" />
            <span className="text-sm">
              {canAddMore ? (
                <>
                  Déposez vos fichiers ou{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary p-0 h-auto font-normal underline"
                    onClick={openFilePicker}
                  >
                    parcourir
                  </Button>
                </>
              ) : (
                "Maximum de 4 photos atteint"
              )}
            </span>
          </div>
          <span className={`text-xs ${canAddMore ? "text-muted-foreground" : "text-foreground/60"}`}>
            JPG, PNG, GIF, WEBP (max 10 MB)
          </span>
        </div>
        <input
          ref={filePickerRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          onChange={onFileInputChange}
          disabled={!canAddMore}
        />
      </Card>

      {/* Info Message */}
      {uploadedPhotos.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Conseil :</strong> La première photo sera votre photo de profil (obligatoire).
            Vous pouvez ajouter jusqu'à 3 autres photos.
          </p>
        </div>
      )}

      {/* Uploaded Photos List */}
      {uploadedPhotos.length > 0 && (
        <div className="flex flex-col gap-y-4">
          <div>
            <h2 className="text-foreground text-lg flex items-center font-mono font-normal uppercase sm:text-xs mb-4">
              <CheckCircle className="mr-1 size-4" />
              Photos ajoutées ({uploadedPhotos.length}/4)
            </h2>
            <div className="-mt-2 divide-y">
              {uploadedPhotos.map((photo, index) => (
                <div key={photo.id} className="group flex items-center py-4 gap-4">
                  {/* Thumbnail */}
                  <div className="relative size-16 shrink-0 rounded border overflow-hidden bg-muted">
                    <Image
                      src={photo.preview}
                      alt={photo.file.name}
                      fill
                      className="object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] px-1 py-0.5 text-center font-medium">
                        Profil
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Camera className="size-4 text-primary shrink-0" />}
                      <span className="select-none text-base/6 text-foreground sm:text-sm/6 truncate">
                        {index === 0 ? "Photo de profil" : `Photo ${index + 1}`}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {photo.file.name} • {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removePhotoById(photo.id)}
                    aria-label="Supprimer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
