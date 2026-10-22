import type {ReactElement} from "react";
import type {Icon, IconProps} from "@phosphor-icons/react";
import {
  Bank as BankBase,
  CalendarCheck as CalendarCheckBase,
  ChatCircleDots as ChatCircleDotsBase,
  CheckSquare as CheckSquareBase,
  ClipboardText as ClipboardTextBase,
  Clock as ClockBase,
  Hourglass as HourglassBase,
  Money as MoneyBase,
  Percent as PercentBase,
  Quotes as QuotesBase,
  Repeat as RepeatBase,
  ShoppingBag as ShoppingBagBase,
  ShoppingCart as ShoppingCartBase,
  Star as StarBase,
  Ticket as TicketBase,
  TShirt as TShirtBase,
  Wallet as WalletBase,
  Warning as WarningBase,
  WarningCircle as WarningCircleBase,
} from "@phosphor-icons/react/ssr";

type SolidIconProps = Omit<IconProps, "weight">;

/**
 * Phosphor draws its icons in one of several weights. The stat cards want the
 * filled one: at the size they render, the outline weight reads as a smudge
 * next to the label and loses its shape against the purple frame.
 */
function solid(Base: Icon): (props: SolidIconProps) => ReactElement {
  const SolidIcon = (props: SolidIconProps) => (
    <Base weight="fill" {...props} />
  );
  SolidIcon.displayName = "SolidIcon";
  return SolidIcon;
}

export const Bank = solid(BankBase);
export const CalendarCheck = solid(CalendarCheckBase);
export const ChatCircleDots = solid(ChatCircleDotsBase);
export const CheckSquare = solid(CheckSquareBase);
export const ClipboardText = solid(ClipboardTextBase);
export const Clock = solid(ClockBase);
export const Hourglass = solid(HourglassBase);
export const Money = solid(MoneyBase);
export const Percent = solid(PercentBase);
export const Quotes = solid(QuotesBase);
export const Repeat = solid(RepeatBase);
export const ShoppingBag = solid(ShoppingBagBase);
export const ShoppingCart = solid(ShoppingCartBase);
export const Star = solid(StarBase);
export const Ticket = solid(TicketBase);
export const TShirt = solid(TShirtBase);
export const Wallet = solid(WalletBase);
export const Warning = solid(WarningBase);
export const WarningCircle = solid(WarningCircleBase);
