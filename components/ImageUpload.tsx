"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    id?: string;
    name?: string;
    label?: string;
    required?: boolean;
    defaultImage?: string | null;
    folder?: string;
    value?: string;
    onChange?: (url: string) => void;
    className?: string;
    previewClassName?: string;
}

export function ImageUpload({
    id,
    name,
    label,
    required,
    defaultImage,
    folder = "misc",
    value,
    onChange,
    className = "",
    previewClassName = ""
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || defaultImage || null);
    const [uploading, setUploading] = useState(false);

    // Sync preview with value prop if provided
    useEffect(() => {
        if (value !== undefined) {
            setPreview(value);
        } else if (defaultImage) {
            setPreview(defaultImage);
        }
    }, [value, defaultImage]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setUploading(true);

        // Upload to API
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setPreview(data.url); // Set to server URL
                if (onChange) {
                    onChange(data.url);
                }
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload error");
        } finally {
            setUploading(false);
        }
    };

    const Content = (
        <div className={`space-y-2 ${label ? "col-span-3" : "w-full"}`}>
            <div className="flex items-center gap-4">
                <Input id={id} type="file" accept="image/*" onChange={handleFileChange} required={required && !preview} />
                {/* Hidden input to store the actual URL that will be submitted with the form */}
                <input type="hidden" name={name} value={preview || ""} />
            </div>

            {uploading && <div className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</div>}

            {preview && (
                <div className={`relative overflow-hidden border ${previewClassName || "w-full h-32 rounded-md"}`}>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );

    if (label) {
        return (
            <div className={`grid grid-cols-4 items-center gap-4 ${className}`}>
                <Label htmlFor={id} className="text-right">
                    {label}
                </Label>
                {Content}
            </div>
        );
    }

    return (
        <div className={className}>
            {Content}
        </div>
    );
}
