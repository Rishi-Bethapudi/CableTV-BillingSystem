// src/components/Layout.tsx (The new main wrapper)
import { usePlatform } from '@/hooks/usePlatform';
import { WebLayout } from './layouts/WebLayout';
import { MobileLayout } from './layouts/MobileLayout';
import { LayoutProvider } from '../components/layouts/LayoutContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isNative, isMobileView } = usePlatform();

  // The LayoutProvider must wrap the chosen layout so pages can communicate with it.
  return (
    <LayoutProvider>
      {isNative || isMobileView ? (
        <MobileLayout>{children}</MobileLayout>
      ) : (
        <WebLayout>{children}</WebLayout>
      )}
    </LayoutProvider>
  );
}
