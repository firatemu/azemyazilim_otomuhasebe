'use client';

/**
 * BarcodeScanner — Hızlı Barkod / QR Kod Tarayıcı
 *
 * Önce yerel BarcodeDetector API'sini dener (Chrome/Edge).
 * Desteklenmiyorsa @zxing/browser fallback ile tarar.
 *
 * Kullanımı:
 *   <BarcodeScanner onDetect={(code) => addPart(code)} />
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, CircularProgress, Typography, Paper } from '@mui/material';
import { CameraAlt, QrCodeScanner, Close } from '@mui/icons-material';

interface BarcodeScannerProps {
    onDetect: (rawValue: string, format?: string) => void;
    onClose?: () => void;
}

export function BarcodeScanner({ onDetect, onClose }: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animRef = useRef<number>(0);
    const [status, setStatus] = useState<'idle' | 'loading' | 'scanning' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const detectedRef = useRef(false); // Bir kez detect yeter

    const stopCamera = useCallback(() => {
        cancelAnimationFrame(animRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
    }, []);

    useEffect(() => {
        let cleanup = false;

        async function startScanner() {
            try {
                // Kamera izni al — arka kamera tercih edilir
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                });

                if (cleanup) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                streamRef.current = stream;
                videoRef.current!.srcObject = stream;
                setStatus('scanning');

                // --- BarcodeDetector API (Native — Chromium) ---
                if ('BarcodeDetector' in window) {
                    const detector = new (window as any).BarcodeDetector({
                        formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'code_39', 'data_matrix'],
                    });

                    const scan = async () => {
                        if (detectedRef.current || !videoRef.current) return;
                        try {
                            const barcodes = await detector.detect(videoRef.current);
                            if (barcodes.length > 0 && !detectedRef.current) {
                                detectedRef.current = true;
                                stopCamera();
                                onDetect(barcodes[0].rawValue, barcodes[0].format);
                            }
                        } catch {
                            // Kare atla
                        }
                        animRef.current = requestAnimationFrame(scan);
                    };
                    animRef.current = requestAnimationFrame(scan);
                } else {
                    // --- ZXing Fallback (Safari / Firefox) ---
                    const { BrowserMultiFormatReader } = await import('@zxing/browser');
                    const reader = new BrowserMultiFormatReader();
                    await reader.decodeFromVideoElement(videoRef.current!, (result, err) => {
                        if (result && !detectedRef.current) {
                            detectedRef.current = true;
                            stopCamera();
                            onDetect(result.getText(), result.getBarcodeFormat().toString());
                        }
                    });
                }
            } catch (err: any) {
                if (!cleanup) {
                    const msg =
                        err.name === 'NotAllowedError'
                            ? 'Kamera erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.'
                            : `Kamera başlatılamadı: ${err.message}`;
                    setErrorMsg(msg);
                    setStatus('error');
                }
            }
        }

        startScanner();

        return () => {
            cleanup = true;
            stopCamera();
        };
    }, [onDetect, stopCamera]);

    return (
        <Box sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}>
            <Box sx={{ position: 'relative', width: '100%', aspectRatio: '4/3', bgcolor: '#000', borderRadius: 2, overflow: 'hidden' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Vizör overlay */}
                {status === 'scanning' && (
                    <>
                        <Box sx={{
                            position: 'absolute', inset: '20%',
                            border: '2px solid #00e676',
                            borderRadius: 2,
                            boxShadow: '0 0 0 2000px rgba(0,0,0,0.4)',
                        }} />
                        {/* Tarama animasyonu */}
                        <Box sx={{
                            position: 'absolute',
                            left: '20%', right: '20%',
                            height: 2,
                            bgcolor: '#00e676',
                            animation: 'scanLine 2s linear infinite',
                            '@keyframes scanLine': {
                                '0%': { top: '20%' },
                                '50%': { top: '80%' },
                                '100%': { top: '20%' },
                            },
                        }} />
                    </>
                )}

                {/* Loading */}
                {status === 'loading' && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                        <CircularProgress color="inherit" sx={{ color: '#fff' }} />
                        <Typography color="white" variant="caption">Kamera başlatılıyor...</Typography>
                    </Box>
                )}

                {/* Hata */}
                {status === 'error' && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <CameraAlt sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                            <Typography variant="body2" color="error">{errorMsg}</Typography>
                        </Paper>
                    </Box>
                )}
            </Box>

            {/* Alt bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QrCodeScanner color="primary" />
                    <Typography variant="caption" color="text.secondary">
                        Barkodu kamera vizörüne hizalayın
                    </Typography>
                </Box>
                {onClose && (
                    <Button size="small" startIcon={<Close />} onClick={onClose}>
                        Kapat
                    </Button>
                )}
            </Box>
        </Box>
    );
}
