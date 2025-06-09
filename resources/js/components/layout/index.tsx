import { Head } from '@inertiajs/react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    title?: string;
}

export default function Layout({ children, title = 'HotelManager' }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            
            <Header />
            
            <main>
                {children}
            </main>
            
            <Footer />
        </div>
    );
}