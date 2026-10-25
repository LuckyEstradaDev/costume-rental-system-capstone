"use client";

import {useEffect, useRef, useState} from "react";
import Cropper, {type Area, type Point} from "react-easy-crop";
import {Camera, Trash2, ZoomIn, ZoomOut} from "lucide-react";
import "react-easy-crop/react-easy-crop.css";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {UserAvatar} from "@/components/UserAvatar";
import {getCroppedImage} from "../utils/cropImage";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ProfilePictureEditorProps {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  disabled?: boolean;
  canRemove: boolean;
  onChange: (change: {file: File | null; removed: boolean}) => void;
}

export function ProfilePictureEditor({
  src,
  firstName,
  lastName,
  disabled = false,
  canRemove,
  onChange,
}: ProfilePictureEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({x: 0, y: 0});
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setProcessing] = useState(false);

  useEffect(() => {
    if (!sourceUrl) {
      return;
    }

    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  const closeCropDialog = () => {
    setSourceUrl(null);
    setCrop({x: 0, y: 0});
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleFileChange = (file: File | undefined) => {
    setError("");

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }

    setCrop({x: 0, y: 0});
    setZoom(1);
    setCroppedAreaPixels(null);
    setSourceUrl(URL.createObjectURL(file));
  };

  const handleApply = async () => {
    if (!sourceUrl || !croppedAreaPixels) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const file = await getCroppedImage(sourceUrl, croppedAreaPixels);
      onChange({file, removed: false});
      closeCropDialog();
    } catch {
      setError("Failed to crop the image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <UserAvatar
          size="lg"
          src={src}
          firstName={firstName}
          lastName={lastName}
        />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <Camera className="size-3.5" />
              {src ? "Change photo" : "Upload photo"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || !canRemove}
              onClick={() => {
                setError("");
                onChange({file: null, removed: true});
              }}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Maximum 5 MB.
          </p>
          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          handleFileChange(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <Dialog
        open={Boolean(sourceUrl)}
        onOpenChange={(open) => {
          if (!open && !isProcessing) {
            closeCropDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adjust your profile picture</DialogTitle>
            <DialogDescription>
              Drag to reposition the image and use the slider to zoom.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-64 overflow-hidden rounded-lg bg-muted sm:h-80">
            {sourceUrl ? (
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedArea) =>
                  setCroppedAreaPixels(croppedArea)
                }
              />
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <ZoomOut className="size-4 shrink-0 text-muted-foreground" />
            <input
              aria-label="Zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-primary"
            />
            <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeCropDialog}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={isProcessing || !croppedAreaPixels}
            >
              {isProcessing ? "Cropping..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
