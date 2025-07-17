import { useState, useEffect } from 'react';

// Breakpoints definidos según el design system
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;
type BreakpointValue = typeof BREAKPOINTS[BreakpointKey];

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  currentBreakpoint: BreakpointKey;
}

interface UseResponsiveOptions {
  debounceMs?: number;
  initialWidth?: number;
  initialHeight?: number;
}

export function useResponsive(options: UseResponsiveOptions = {}): ResponsiveState {
  const { 
    debounceMs = 100, 
    initialWidth = 1024, 
    initialHeight = 768 
  } = options;

  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : initialWidth,
    height: typeof window !== 'undefined' ? window.innerHeight : initialHeight,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [debounceMs]);

  // Determinar el breakpoint actual
  const getCurrentBreakpoint = (width: number): BreakpointKey => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  };

  const currentBreakpoint = getCurrentBreakpoint(dimensions.width);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isMobile: dimensions.width < BREAKPOINTS.md, // < 768px
    isTablet: dimensions.width >= BREAKPOINTS.md && dimensions.width < BREAKPOINTS.lg, // 768px - 1023px
    isDesktop: dimensions.width >= BREAKPOINTS.lg && dimensions.width < BREAKPOINTS.xl, // 1024px - 1279px
    isLargeDesktop: dimensions.width >= BREAKPOINTS.xl, // >= 1280px
    currentBreakpoint,
  };
}

// Hook para verificar si estamos en un breakpoint específico o superior
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

// Hook para layouts condicionales basados en breakpoints
export function useLayout() {
  const responsive = useResponsive();
  
  return {
    ...responsive,
    // Layout helpers
    showSidebar: responsive.isDesktop || responsive.isLargeDesktop,
    showMobileMenu: responsive.isMobile || responsive.isTablet,
    columnCount: responsive.isMobile ? 1 : responsive.isTablet ? 2 : responsive.isDesktop ? 3 : 4,
    gridCols: responsive.isMobile ? 'grid-cols-1' : responsive.isTablet ? 'grid-cols-2' : responsive.isDesktop ? 'grid-cols-3' : 'grid-cols-4',
    
    // Chat layout específico
    chatLayout: {
      showInboxSidebar: responsive.isDesktop || responsive.isLargeDesktop,
      showChatList: responsive.width >= BREAKPOINTS.sm,
      showAIPanel: responsive.width >= BREAKPOINTS.lg,
      showClientInfo: responsive.width >= BREAKPOINTS.xl,
      collapseToMobile: responsive.isMobile,
    },
    
    // Panel widths responsive
    panelWidths: {
      sidebar: responsive.isMobile ? 'w-16' : 'w-20',
      inbox: responsive.isTablet ? 'w-64' : 'w-80',
      chatList: responsive.isTablet ? 'w-72' : 'w-80',
      aiPanel: responsive.isDesktop ? 'w-80' : 'w-96',
    },
    
    // Typography scale
    textSizes: {
      xs: responsive.isMobile ? 'text-xs' : 'text-sm',
      sm: responsive.isMobile ? 'text-sm' : 'text-base',
      base: responsive.isMobile ? 'text-base' : 'text-lg',
      lg: responsive.isMobile ? 'text-lg' : 'text-xl',
      xl: responsive.isMobile ? 'text-xl' : 'text-2xl',
    },
    
    // Spacing scale
    spacing: {
      xs: responsive.isMobile ? 'p-2' : 'p-3',
      sm: responsive.isMobile ? 'p-3' : 'p-4',
      md: responsive.isMobile ? 'p-4' : 'p-6',
      lg: responsive.isMobile ? 'p-6' : 'p-8',
    },
  };
}

// Utilidad para clases condicionales basadas en breakpoints
export function responsiveClasses(classes: Partial<Record<BreakpointKey, string>>): string {
  const { currentBreakpoint } = useResponsive();
  
  // Encuentra la clase más específica para el breakpoint actual o inferior
  const orderedBreakpoints: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = orderedBreakpoints.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = orderedBreakpoints[i];
    if (classes[breakpoint]) {
      return classes[breakpoint]!;
    }
  }
  
  return '';
}

// Hook para optimizaciones de performance en mobile
export function usePerformanceOptimizations() {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    // Reducir animaciones en móvil
    shouldReduceMotion: isMobile,
    
    // Lazy loading más agresivo en móvil
    lazyLoadThreshold: isMobile ? 100 : 200,
    
    // Paginación más pequeña en móvil
    pageSize: isMobile ? 10 : isTablet ? 20 : 50,
    
    // Debounce más largo en móvil para búsquedas
    searchDebounce: isMobile ? 500 : 300,
    
    // Virtualización para listas largas
    enableVirtualization: isMobile || isTablet,
  };
} 