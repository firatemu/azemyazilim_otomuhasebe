import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bekleme Salonu - Servis Durumu',
    description: 'Araç servis durumu takip ekranı',
};

export default function WaitingLoungeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // No navigation, just the content for full-screen public display
    return <>{children}</>;
}

