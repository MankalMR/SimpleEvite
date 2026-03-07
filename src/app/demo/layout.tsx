import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Demo - Simple Evite',
    description: 'Try Simple Evite without signing up. Explore the full feature set with sample data.',
};

export default function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
