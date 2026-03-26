import {
  AccountBalance,
  AccountBalanceWallet,
  Add,
  Assessment,
  Assignment,
  AttachMoney,
  Badge,
  Build,
  CalendarMonth,
  Campaign,
  Category,
  CheckCircle,
  Close,
  CloudUpload,
  CloudDownload,
  CreditCard,
  Dashboard,
  Delete,
  Description,
  DirectionsCar,
  Engineering,
  FlashOn,
  ExpandLess,
  ExpandMore,
  Inventory,
  LocalOffer,
  LocalShipping,
  Logout,
  Menu as MenuIcon,
  MoreVert,
  Notifications,
  Payment,
  People,
  PointOfSale,
  PushPin,
  Receipt,
  ReceiptLong,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Sync,
  SwapHoriz,
  TrendingDown,
  TrendingUp,
  Tv,
  Warehouse,
  Warning,
  AdminPanelSettings,
  Event,
  Help,
  Factory,
  LocalTaxi,
  Scale,
  ShoppingCartCheckout,
  AttachFile,
  Inventory2,
  CategoryOutlined,
  Person,
  Mail,
  Phone,
  LocationOn,
  Business,
  CreditScore,
  AccountBalanceWalletOutlined,
  PriceChange,
  ShowChart,
  AssessmentOutlined,
  PieChart,
  BarChart,
} from '@mui/icons-material';

// Icon mapping from Sidebar.tsx - extended with additional icons
export const IconMap: Record<string, React.ComponentType<any>> = {
  AccountBalance,
  AccountBalanceWallet,
  Add,
  Assessment,
  Assignment,
  AttachMoney,
  Badge,
  Build,
  CalendarMonth,
  Campaign,
  Category,
  CheckCircle,
  Close,
  CloudUpload,
  CloudDownload,
  CreditCard,
  Dashboard,
  Delete,
  Description,
  DirectionsCar,
  Engineering,
  FlashOn,
  ExpandLess,
  ExpandMore,
  Inventory,
  LocalOffer,
  LocalShipping,
  Logout,
  Menu: MenuIcon,
  MoreVert,
  Notifications,
  Payment,
  People,
  PointOfSale,
  PushPin,
  Receipt,
  ReceiptLong,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Sync,
  SwapHoriz,
  TrendingDown,
  TrendingUp,
  Tv,
  Warehouse,
  Warning,
  AdminPanelSettings,
  Event,
  Help,
  // Additional icons that might be in menuItems
  Factory,
  LocalTaxi,
  Scale,
  ShoppingCartCheckout,
  AttachFile,
  Inventory2,
  CategoryOutlined,
  Person,
  Mail,
  Phone,
  LocationOn,
  Business,
  CreditScore,
  AccountBalanceWalletOutlined,
  PriceChange,
  ShowChart,
  AssessmentOutlined,
  PieChart,
  BarChart,
};

/**
 * Get icon component by name
 * Falls back to Help icon if not found
 */
export const getIconComponent = (iconName: string): React.ComponentType<any> => {
  return IconMap[iconName] || Help;
};

/**
 * Adjust hex color brightness
 * @param color - Hex color (e.g., "#667eea")
 * @param amount - Amount to adjust (-255 to 255)
 * @returns Adjusted hex color
 */
export const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;

  return `#${(r << 16) | (g << 8) | b}`;
};

/**
 * Generate gradient from base color
 * @param color - Base hex color
 * @returns CSS linear-gradient string
 */
export const generateGradient = (color: string): string => {
  const darkerColor = adjustColor(color, -20);
  return `linear-gradient(135deg, ${color} 0%, ${darkerColor} 100%)`;
};

/**
 * Generate shadow color from base color
 * @param color - Base hex color
 * @param opacity - Opacity (0-1)
 * @returns CSS rgba color string
 */
export const generateShadowColor = (color: string, opacity: number = 0.3): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
