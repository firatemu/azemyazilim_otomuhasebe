export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  path?: string;
  section: string;
  subItems?: MenuItem[];
}

export interface MenuSliderProps {
  // Data
  menuItems: MenuItem[];

  // Display Mode
  displayMode?: 'slider' | 'grid';

  // Behavior
  autoRotate?: boolean;
  autoRotateInterval?: number; // milliseconds (default: 5000)
  enableSubItems?: boolean;

  // Styling
  variant?: 'full' | 'compact' | 'overlay';
  showBackground?: boolean;
  backgroundType?: 'gradient' | 'solid' | 'image';

  // Callbacks
  onMenuClick?: (item: MenuItem) => void;
  onSubItemClick?: (parent: MenuItem, subItem: MenuItem) => void;

  // Responsive
  fullWidthMobile?: boolean;

  // Accessibility
  ariaLabel?: string;
}

export interface MenuCardProps {
  item: MenuItem;
  isActive?: boolean;
  onClick: () => void;
  showSubItemsPreview?: boolean;
}

export interface SlideControlsProps {
  currentIndex: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export interface SubMenuDialogProps {
  open: boolean;
  onClose: () => void;
  parentItem: MenuItem;
  onSubItemClick: (subItem: MenuItem) => void;
  onBack?: () => void;
}
