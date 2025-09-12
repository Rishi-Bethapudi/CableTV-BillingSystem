// src/components/Layout.tsx
import { usePlatform } from '@/hooks/usePlatform';
import { WebLayout } from './layouts/WebLayout';
import { MobileLayout } from './layouts/MobileLayout';
import { LayoutProvider } from '../components/layouts/LayoutContext';
import { Outlet } from 'react-router-dom';

export function Layout() {
  const { isNative, isMobileView } = usePlatform();

  return (
    <LayoutProvider>
      {isNative || isMobileView ? (
        <MobileLayout>
          <Outlet /> {/* Nested routes will render here */}
        </MobileLayout>
      ) : (
        <WebLayout>
          <Outlet /> {/* Nested routes will render here */}
        </WebLayout>
      )}
    </LayoutProvider>
  );
}
