'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useSpring, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  id: string;
}

/**
 * 3D Adaptive Navigation Pill
 * Smart navigation with scroll detection and hover expansion
 */
export const PillBase: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSectionRef = useRef('home');

  const navItems: NavItem[] = [
    { label: 'Home', id: 'home' },
    { label: 'Chat', id: 'chat' },
    { label: 'Interviews', id: 'interviews' },
    { label: 'Contact', id: 'contact' },
  ];

  // Spring animations for smooth motion
  const pillWidth = useSpring(140, { stiffness: 220, damping: 25, mass: 1 });
  const pillShift = useSpring(0, { stiffness: 220, damping: 25, mass: 1 });

  // No scroll detection - purely click-based navigation

  // Handle hover expansion
  useEffect(() => {
    if (hovering) {
      setExpanded(true);
      pillWidth.set(580);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false);
        pillWidth.set(140);
      }, 600);
    }
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [hovering, pillWidth]);

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  const handleSectionClick = (sectionId: string) => {
    // Trigger transition state
    setIsTransitioning(true);
    prevSectionRef.current = sectionId;
    setActiveSection(sectionId);

    // Collapse the pill after selection
    setHovering(false);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  // navigation: map section ids to routes and navigate
  const router = useRouter();
  const routeFor = (sectionId: string) => {
    switch (sectionId) {
      case 'home':
        return '/';
      case 'chat':
        return '/chat';
      case 'interviews':
        return '/interview';
      case 'contact':
        return '/contact';
      default:
        return '/';
    }
  };

  const handleNavigate = (sectionId: string) => {
    handleSectionClick(sectionId);
    try {
      router.push(routeFor(sectionId));
    } catch (e) {
      // router may fail in non-client contexts; swallow for safety
      // console.warn('navigation failed', e);
    }
  };

  const activeItem = navItems.find(item => item.id === activeSection);

  return (
    <motion.nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-full"
      style={{
        width: pillWidth,
        height: '56px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: '0.5px solid rgba(255, 255, 255, 0.15)',
        boxShadow: expanded
          ? `
            0 20px 60px rgba(0, 0, 0, 0.15),
            0 8px 24px rgba(0, 0, 0, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.4)
          `
          : isTransitioning
            ? `
            0 12px 40px rgba(0, 0, 0, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.4)
          `
            : `
            0 12px 40px rgba(0, 0, 0, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.4)
          `,
        x: pillShift,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-out',
      }}
    >
      {/* Soft inner shine - top-left gradient overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 30%, rgba(255, 255, 255, 0.03) 60%, transparent 100%)',
        }}
      />

      {/* Subtle top edge highlight */}
      <div
        className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
        }}
      />

      {/* Navigation items container */}
      <div
        ref={containerRef}
        className="relative z-10 h-full flex items-center justify-center px-6"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
        }}
      >
        {/* Collapsed state - show only active section with smooth text transitions */}
        {!expanded && (
          <div className="flex items-center relative">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.span
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.35,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  className="text-white"
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 680,
                    letterSpacing: '0.45px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                  }}
                >
                  {activeItem.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Expanded state - show all sections with stagger */}
        {expanded && (
          <div className="flex items-center justify-evenly w-full">
            {navItems.map((item, index) => {
              const isActive = item.id === activeSection;

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.25,
                    ease: 'easeOut'
                  }}
                  onClick={() => handleNavigate(item.id)}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white/90'
                  }`}
                  style={{
                    fontSize: isActive ? '15.5px' : '15px',
                    fontWeight: isActive ? 680 : 510,
                    textDecoration: 'none',
                    letterSpacing: '0.45px',
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 16px',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                  }}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

