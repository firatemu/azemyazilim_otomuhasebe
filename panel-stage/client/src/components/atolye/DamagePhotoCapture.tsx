'use client';

/**
 * DamagePhotoCapture — Araç Hasar Fotoğrafı Çekme ve Yükleme
 *
 * - Mobil: <input capture="environment"> ile doğrudan kamera
 * - Masaüstü: Dosya seçici
 * - Canvas API ile istemci tarafı JPEG sıkıştırma (kalite ayarlanabilir)
 * - Çoklu fotoğraf desteği (max 5 adet)
 */

import axiosInstance from '@/lib/axios';
import { AddAPhoto, Delete, CloudUpload } from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    IconButton,
    Typography,
    LinearProgress,
} from '@mui/material';
import { useRef, useState } from 'react';

// ─────────────────────────────────────────────────
// Canvas sıkıştırma yardımcısı
// ─────────────────────────────────────────────────

async function compressImage(file: File, maxWidthPx = 1920, qualityJpeg = 0.75): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const ratio = Math.min(maxWidthPx / img.width, 1);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * ratio);
            canvas.height = Math.round(img.height * ratio);

            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context alınamadı'));

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(objectUrl);
                    blob ? resolve(blob) : reject(new Error('Blob oluşturulamadı'));
                },
                'image/jpeg',
                qualityJpeg
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Görsel yüklenemedi'));
        };
        img.src = objectUrl;
    });
}

// ─────────────────────────────────────────────────
// Bileşen
// ─────────────────────────────────────────────────

interface PhotoItem {
    id: string;
    previewUrl: string;
    blob: Blob;
    originalSize: number;
    compressedSize: number;
}

interface DamagePhotoCaptureProps {
    workOrderId: string;
    maxPhotos?: number;
    onUploadComplete?: (count: number) => void;
}

export function DamagePhotoCapture({
    workOrderId,
    maxPhotos = 5,
    onUploadComplete,
}: DamagePhotoCaptureProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const remaining = maxPhotos - photos.length;
        const toProcess = files.slice(0, remaining);

        for (const file of toProcess) {
            try {
                const compressed = await compressImage(file);
                const previewUrl = URL.createObjectURL(compressed);
                setPhotos((prev) => [
                    ...prev,
                    {
                        id: `${Date.now()}-${Math.random()}`,
                        previewUrl,
                        blob: compressed,
                        originalSize: file.size,
                        compressedSize: compressed.size,
                    },
                ]);
            } catch (err) {
                setError('Fotoğraf işlenirken hata oluştu.');
            }
        }
        // Input'u sıfırla (aynı dosyayı tekrar seçebilmek için)
        e.target.value = '';
    };

    const removePhoto = (id: string) => {
        setPhotos((prev) => {
            const photo = prev.find((p) => p.id === id);
            if (photo) URL.revokeObjectURL(photo.previewUrl);
            return prev.filter((p) => p.id !== id);
        });
    };

    const handleUpload = async () => {
        if (!photos.length) return;
        setUploading(true);
        setError(null);
        let uploaded = 0;

        for (const photo of photos) {
            try {
                const formData = new FormData();
                formData.append('photo', photo.blob, `damage-${Date.now()}.jpg`);
                formData.append('workOrderId', workOrderId);

                await axiosInstance.post(`/work-orders/${workOrderId}/damage-photos`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const total = progressEvent.total ?? 1;
                        const percent = Math.round((progressEvent.loaded / total) * 100);
                        setUploadProgress(Math.round(((uploaded + percent / 100) / photos.length) * 100));
                    },
                });
                uploaded++;
            } catch {
                setError('Bazı fotoğraflar yüklenemedi. Lütfen tekrar deneyin.');
            }
        }

        setUploading(false);
        setUploadProgress(0);
        if (uploaded > 0) {
            setPhotos([]);
            onUploadComplete?.(uploaded);
        }
    };

    const formatBytes = (bytes: number) =>
        bytes < 1024 * 1024
            ? `${Math.round(bytes / 1024)} KB`
            : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    return (
        <Box>
            {/* Fotoğraf önizleme */}
            {photos.length > 0 && (
                <ImageList cols={3} rowHeight={120} sx={{ mb: 2 }}>
                    {photos.map((photo) => (
                        <ImageListItem key={photo.id}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={photo.previewUrl}
                                alt="Hasar fotoğrafı"
                                style={{ height: 120, width: '100%', objectFit: 'cover' }}
                            />
                            <ImageListItemBar
                                subtitle={`${formatBytes(photo.originalSize)} → ${formatBytes(photo.compressedSize)}`}
                                actionIcon={
                                    <IconButton size="small" onClick={() => removePhoto(photo.id)} sx={{ color: '#fff' }}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            )}

            {/* Upload progress */}
            {uploading && (
                <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="caption" color="text.secondary">
                        Yükleniyor... {uploadProgress}%
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                    {error}
                </Typography>
            )}

            {/* Butonlar */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {photos.length < maxPhotos && (
                    <>
                        {/* Gizli input — mobilde kamera, masaüstünde dosya seçici */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<AddAPhoto />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            Fotoğraf Ekle ({photos.length}/{maxPhotos})
                        </Button>
                    </>
                )}

                {photos.length > 0 && (
                    <Button
                        variant="contained"
                        startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? 'Yükleniyor...' : `${photos.length} Fotoğrafı Yükle`}
                    </Button>
                )}
            </Box>
        </Box>
    );
}
