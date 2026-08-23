"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Activity01Icon,
  Add01Icon,
  Analytics01Icon,
  ArrowDataTransferHorizontalIcon,
  ArrowRight01Icon,
  BookOpen01Icon,
  Building02Icon,
  Calendar03Icon,
  CalendarClockIcon,
  ClipboardListIcon,
  CreditCardIcon,
  DashboardSquare01Icon,
  DentalToothIcon,
  Dumbbell01Icon,
  File01Icon,
  FlaskConicalIcon,
  HardDriveIcon,
  HeartPulseIcon,
  Home01Icon,
  Hospital01Icon,
  Invoice03Icon,
  Layers01Icon,
  Logout03Icon,
  Medicine02Icon,
  MoreHorizontalIcon,
  Notification03Icon,
  Package01Icon,
  PatientIcon,
  Search01Icon,
  Settings01Icon,
  Shield01Icon,
  ShuffleIcon,
  SpeechIcon,
  Store01Icon,
  UserIcon,
  UserMultipleIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

const APP_ICONS = {
  activity: Activity01Icon,
  add: Add01Icon,
  analytics: Analytics01Icon,
  book: BookOpen01Icon,
  building: Building02Icon,
  calendar: Calendar03Icon,
  calendarClock: CalendarClockIcon,
  clipboard: ClipboardListIcon,
  creditCard: CreditCardIcon,
  dental: DentalToothIcon,
  dumbbell: Dumbbell01Icon,
  file: File01Icon,
  flask: FlaskConicalIcon,
  grid: DashboardSquare01Icon,
  hardDrive: HardDriveIcon,
  heartPulse: HeartPulseIcon,
  home: Home01Icon,
  hospital: Hospital01Icon,
  invoice: Invoice03Icon,
  layers: Layers01Icon,
  logout: Logout03Icon,
  moreHorizontal: MoreHorizontalIcon,
  notification: Notification03Icon,
  package: Package01Icon,
  patient: PatientIcon,
  pill: Medicine02Icon,
  search: Search01Icon,
  settings: Settings01Icon,
  shield: Shield01Icon,
  shuffle: ShuffleIcon,
  speech: SpeechIcon,
  store: Store01Icon,
  transfer: ArrowDataTransferHorizontalIcon,
  user: UserIcon,
  users: UserMultipleIcon,
  wallet: Wallet01Icon,
  chevronRight: ArrowRight01Icon,
} as const;

export type AppIconName = keyof typeof APP_ICONS;

type AppIconProps = {
  name: AppIconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function AppIcon({
  name,
  size = 18,
  strokeWidth = 1.5,
  className,
}: AppIconProps) {
  return (
    <HugeiconsIcon
      icon={APP_ICONS[name] as IconSvgElement}
      size={size}
      strokeWidth={strokeWidth}
      color="currentColor"
      className={className}
    />
  );
}
