'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { SearchIcon, BellIcon, UserIcon, ChevronDownIcon, ShoppingCart, LogIn, Trash2, X, Moon, Sun, Calendar, Smile, Calculator, Settings, CreditCard, LogOut, Loader2, Globe, Home, Heart, HelpCircle, Mail, UserPlus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { APP_TEXTE } from '@/shared/constants/texte';

// Cart Item Interface
export interface CartItem {
  id: string;
  name: string;
  service: string;
  quantity: number;
  hours: number;
  price: number;
  image?: string;
}

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 324 323' fill='currentColor' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect
        x='88.1023'
        y='144.792'
        width='151.802'
        height='36.5788'
        rx='18.2894'
        transform='rotate(-38.5799 88.1023 144.792)'
        fill='currentColor'
      />
      <rect
        x='85.3459'
        y='244.537'
        width='151.802'
        height='36.5788'
        rx='18.2894'
        transform='rotate(-38.5799 85.3459 244.537)'
        fill='currentColor'
      />
    </svg>
  );
};

// Hamburger icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

// Notification Menu Component
const NotificationMenu = ({
  notificationCount = 3,
  onItemClick
}: {
  notificationCount?: number;
  onItemClick?: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9 relative" suppressHydrationWarning>
        <BellIcon className="h-4 w-4" />
        {notificationCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {notificationCount > 9 ? '9+' : notificationCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.('notification1')}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">New message received</p>
          <p className="text-xs text-muted-foreground">2 minutes ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('notification2')}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">System update available</p>
          <p className="text-xs text-muted-foreground">1 hour ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('notification3')}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Weekly report ready</p>
          <p className="text-xs text-muted-foreground">3 hours ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.('view-all')}>
        View all notifications
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Cart Menu Component
const CartMenu = ({
  cartItems = [],
  onViewCart,
  onRemoveItem
}: {
  cartItems?: CartItem[];
  onViewCart?: () => void;
  onRemoveItem?: (itemId: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalHours = cartItems.reduce((total, item) => total + (item.hours * item.quantity), 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" suppressHydrationWarning>
          <ShoppingCart className="h-4 w-4" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </Badge>
          )}
          <span className="sr-only">Panier</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        {/* Header - Fixed */}
        <SheetHeader className="p-6 pb-4 flex-shrink-0">
          <SheetTitle className="text-2xl">Panier ({cartItemCount})</SheetTitle>
        </SheetHeader>

        <div className="border-t flex-shrink-0" />

        {cartItems.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Votre panier est vide</p>
          </div>
        ) : (
          <>
            {/* Scrollable Content - Only this part scrolls */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6">
              <div className="space-y-4 py-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-accent/50 transition-colors rounded-lg border">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded-md border flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-grow min-w-0">
                            <h4 className="font-semibold text-base truncate">{item.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{item.service}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.hours}h de travail
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveItem?.(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Qté: {item.quantity}</span>
                            <span>×</span>
                            <span>{item.price.toLocaleString('fr-FR')}€</span>
                          </div>
                          <p className="font-bold text-base">
                            {(item.price * item.quantity).toLocaleString('fr-FR')}€
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t flex-shrink-0" />

            {/* Footer - Fixed */}
            <div className="p-6 bg-muted/30 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-lg">Sous-total</span>
                <span className="font-bold text-2xl">{subtotal.toLocaleString('fr-FR')}€</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Total heures</span>
                <span className="text-sm font-medium">{totalHours}h</span>
              </div>

              <Button
                onClick={() => {
                  setOpen(false);
                  onViewCart?.();
                }}
                className="w-full"
                size="lg"
              >
                Procéder à la commande
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

// Language Menu Component
const LanguageMenu = ({
  currentLanguage = 'Fr',
  onLanguageChange
}: {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}) => (
  <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2" suppressHydrationWarning>
    <Globe className="h-4 w-4" />
    <span className="text-sm font-medium">{currentLanguage}</span>
    <ChevronDownIcon className="h-3 w-3" />
    <span className="sr-only">Language: {currentLanguage}</span>
  </Button>
);

// User Menu Component
const UserMenu = ({
  userName = 'John Doe',
  userEmail = 'john@example.com',
  userAvatar,
  onItemClick
}: {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onItemClick?: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-9 gap-1 px-2 hover:bg-accent hover:text-accent-foreground" suppressHydrationWarning>
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="text-xs">
            {userName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon className="h-3 w-3" />
        <span className="sr-only">User menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {userEmail}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.('profile')}>
        <UserIcon className="mr-2 h-4 w-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('settings')}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('billing')}>
        <CreditCard className="mr-2 h-4 w-4" />
        Billing
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.('logout')}>
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Types
export interface Navbar08SubItem {
  href: string;
  label: string;
  description?: string;
}

export interface Navbar08NavItem {
  href?: string;
  label: string;
  active?: boolean;
  subItems?: Navbar08SubItem[];
  featured?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface Navbar08Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar08NavItem[];
  searchPlaceholder?: string;
  searchShortcut?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  cartItems?: CartItem[];
  currentLanguage?: string;
  onNavItemClick?: (href: string) => void;
  onSearchSubmit?: (query: string) => void;
  onNotificationItemClick?: (item: string) => void;
  onViewCart?: () => void;
  onRemoveCartItem?: (itemId: string) => void;
  onUserItemClick?: (item: string) => void;
  onLoginClick?: () => void;
  onLanguageChange?: (language: string) => void;
}

// Default navigation links
const defaultNavigationLinks: Navbar08NavItem[] = [
  { href: '#', label: 'Home', active: true },
  { href: '#', label: 'Features' },
  { href: '#', label: 'Pricing' },
  { href: '#', label: 'About' },
];

export const Navbar08 = React.forwardRef<HTMLElement, Navbar08Props>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = '#',
      navigationLinks = defaultNavigationLinks,
      searchPlaceholder = 'Search...',
      searchShortcut = '⌘K',
      userName = 'John Doe',
      userEmail = 'john@example.com',
      userAvatar,
      notificationCount = 3,
      cartItems = [],
      currentLanguage,
      onNavItemClick,
      onSearchSubmit,
      onNotificationItemClick,
      onViewCart,
      onRemoveCartItem,
      onUserItemClick,
      onLoginClick,
      onLanguageChange,
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [openCommandDialog, setOpenCommandDialog] = useState(false);
    const [loadingNavItem, setLoadingNavItem] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpenCommandDialog((open) => !open);
        }
      };
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };

      checkWidth();

      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    // Combine refs
    const combinedRef = React.useCallback((node: HTMLElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const query = formData.get('search') as string;
      if (onSearchSubmit) {
        onSearchSubmit(query);
      }
    };

    const handleMobileNavClick = (href: string) => {
      setLoadingNavItem(href);
      if (onNavItemClick) {
        onNavItemClick(href);
      }
      // Simulate navigation completion after a short delay
      setTimeout(() => {
        setLoadingNavItem(null);
        setMobileMenuOpen(false);
      }, 500);
    };

    return (
      <header
        ref={combinedRef}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline',
          className
        )}
        suppressHydrationWarning
        {...props}
      >
        <div className="container mx-auto max-w-screen-2xl">
          {/* Top section */}
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex flex-1 items-center gap-2">
              {/* Mobile menu trigger */}
              {isMobile && (
                <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      className="group h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                      variant="ghost"
                      size="icon"
                    >
                      <HamburgerIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 p-1">
                    <NavigationMenu className="max-w-none">
                      <NavigationMenuList className="flex-col items-start gap-0">
                        {navigationLinks.map((link, index) => (
                          <NavigationMenuItem key={index} className="w-full">
                            {link.subItems && link.subItems.length > 0 && !link.href ? (
                              <>
                                <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                                  {link.label}
                                </div>
                                <ul>
                                  {link.subItems.map((subItem, subIndex) => (
                                    <li key={subIndex}>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleMobileNavClick(subItem.href);
                                        }}
                                        disabled={loadingNavItem === subItem.href}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {loadingNavItem === subItem.href && (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                        {subItem.label}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (link.href) handleMobileNavClick(link.href);
                                }}
                                disabled={loadingNavItem === link.href}
                                className={cn(
                                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline disabled:opacity-50 disabled:cursor-not-allowed',
                                  link.active && 'bg-accent text-accent-foreground'
                                )}
                              >
                                {loadingNavItem === link.href && (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {link.label}
                              </button>
                            )}
                            {/* Séparateur entre items */}
                            {index < navigationLinks.length - 1 &&
                              ((!link.subItems && navigationLinks[index + 1].subItems) ||
                                (link.subItems && !navigationLinks[index + 1].subItems)) && (
                                <div
                                  role="separator"
                                  aria-orientation="horizontal"
                                  className="bg-border -mx-1 my-1 h-px w-full"
                                />
                              )}
                          </NavigationMenuItem>
                        ))}
                      </NavigationMenuList>
                    </NavigationMenu>
                  </PopoverContent>
                </Popover>
              )}
              {/* Logo */}
              <div className="flex items-center">
                <button
                  onClick={() => onNavItemClick?.(logoHref)}
                  className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
                >
                  <div className="text-2xl">
                    {logo}
                  </div>
                  <span className="hidden font-bold text-xl sm:inline-block">{APP_TEXTE.logoText}</span>
                </button>
              </div>
            </div>
            {/* Middle area */}
            <div className="grow">
              {/* Search form */}
              <div className="relative mx-auto w-full max-w-xs">
                <Input
                  name="search"
                  className="peer h-8 ps-8 pe-10 cursor-pointer"
                  placeholder={searchPlaceholder}
                  type="search"
                  readOnly
                  onClick={() => setOpenCommandDialog(true)}
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                  <SearchIcon size={16} />
                </div>
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2">
                  <kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {searchShortcut}
                  </kbd>
                </div>
              </div>
            </div>
            {/* Right side */}
            <div className="flex flex-1 items-center justify-end gap-2">
              {/* Language Menu */}
              {currentLanguage && (
                <LanguageMenu
                  currentLanguage={currentLanguage}
                  onLanguageChange={onLanguageChange}
                />
              )}
              {/* Dark Mode Toggle - Visible sur mobile uniquement */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle dark mode"
                  suppressHydrationWarning
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              )}
              {/* Login button - Visible sur toutes les tailles d'écran */}
              <Button
                variant="default"
                size="sm"
                onClick={onLoginClick}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Se connecter
              </Button>
            </div>
          </div>
          {/* Bottom navigation */}
          {!isMobile && (
            <div className="border-t py-2">
              <div className="flex items-center justify-between">
                {/* Navigation menu */}
                <NavigationMenu>
                  <NavigationMenuList className="gap-2">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index}>
                        {link.subItems && link.subItems.length > 0 ? (
                          <>
                            <NavigationMenuTrigger
                              className={cn(
                                'text-muted-foreground hover:text-primary py-1.5 font-medium transition-colors h-10',
                                link.active && 'text-primary'
                              )}
                            >
                              {link.label}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                              {link.featured ? (
                                <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                  {/* Featured section */}
                                  <div className="row-span-3">
                                    <NavigationMenuLink asChild>
                                      <button
                                        onClick={(e) => e.preventDefault()}
                                        className="flex h-full w-full select-none flex-col justify-center items-center text-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-0 no-underline outline-none focus:shadow-md cursor-pointer overflow-hidden"
                                      >
                                        {link.featured.image ? (
                                          <img
                                            src={link.featured.image}
                                            alt={link.featured.title || 'Featured'}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="p-6">
                                            {link.featured.title && (
                                              <div className="mb-3 text-xl font-medium">
                                                {link.featured.title}
                                              </div>
                                            )}
                                            {link.featured.description && (
                                              <p className="text-sm leading-tight text-muted-foreground">
                                                {link.featured.description}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </button>
                                    </NavigationMenuLink>
                                  </div>
                                  {/* Sub items */}
                                  {link.subItems.map((subItem, subIndex) => (
                                    <NavigationMenuLink asChild key={subIndex}>
                                      <a
                                        href={subItem.href}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (onNavItemClick) onNavItemClick(subItem.href);
                                        }}
                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                                      >
                                        <div className="text-base font-medium leading-none">{subItem.label}</div>
                                        {subItem.description && (
                                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                            {subItem.description}
                                          </p>
                                        )}
                                      </a>
                                    </NavigationMenuLink>
                                  ))}
                                </div>
                              ) : (
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                  {link.subItems.map((subItem, subIndex) => (
                                    <li key={subIndex}>
                                      <NavigationMenuLink asChild>
                                        <a
                                          href={subItem.href}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            if (onNavItemClick) onNavItemClick(subItem.href);
                                          }}
                                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                                        >
                                          <div className="text-sm font-medium leading-none">{subItem.label}</div>
                                          {subItem.description && (
                                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                              {subItem.description}
                                            </p>
                                          )}
                                        </a>
                                      </NavigationMenuLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </NavigationMenuContent>
                          </>
                        ) : (
                          <NavigationMenuLink
                            href={link.href}
                            onClick={(e) => {
                              e.preventDefault();
                              if (onNavItemClick && link.href) onNavItemClick(link.href);
                            }}
                            className={cn(
                              'text-muted-foreground hover:text-primary py-1.5 font-medium transition-colors cursor-pointer group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
                              link.active && 'text-primary'
                            )}
                            data-active={link.active}
                          >
                            {link.label}
                          </NavigationMenuLink>
                        )}
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
          )}
        </div>

        {/* Command Dialog */}
        {mounted && (
          <CommandDialog open={openCommandDialog} onOpenChange={setOpenCommandDialog}>
            <CommandInput placeholder="Rechercher..." />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <CommandGroup heading="Navigation">
                <CommandItem onSelect={() => {
                  if (onNavItemClick) onNavItemClick('/');
                  setOpenCommandDialog(false);
                }}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Accueil</span>
                </CommandItem>
                <CommandItem onSelect={() => {
                  if (onNavItemClick) onNavItemClick('/abonnements');
                  setOpenCommandDialog(false);
                }}>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Abonnements</span>
                </CommandItem>
                <CommandItem onSelect={() => {
                  if (onNavItemClick) onNavItemClick('/faq');
                  setOpenCommandDialog(false);
                }}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>FAQ</span>
                </CommandItem>
                <CommandItem onSelect={() => {
                  if (onNavItemClick) onNavItemClick('/contact');
                  setOpenCommandDialog(false);
                }}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Contact</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Compte">
                <CommandItem onSelect={() => {
                  if (onLoginClick) onLoginClick();
                  setOpenCommandDialog(false);
                }}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Se connecter</span>
                </CommandItem>
                <CommandItem onSelect={() => {
                  if (onNavItemClick) onNavItemClick('/customer/auth/register');
                  setOpenCommandDialog(false);
                }}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>S'inscrire</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        )}
      </header>
    );
  }
);

Navbar08.displayName = 'Navbar08';

export { Logo, HamburgerIcon, NotificationMenu, CartMenu, UserMenu, LanguageMenu };