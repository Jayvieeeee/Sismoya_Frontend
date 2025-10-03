export interface ModalProduct {
  id: number;
  gallon_id?: number;
  cart_item_id?: number;
  type: string;
  liters: number;
  price: number;
  qty: number;
  quantity?: number;
  image_url?: string;
  selected?: boolean;
  total_price?: number;
}

export interface CartItem {
  cart_item_id?: number;
  gallon_id: number;
  id?: number; // For compatibility
  type?: string;
  liters?: number;
  price?: number;
  quantity: number;
  qty?: number; // For compatibility
  total_price?: number;
  image_url?: string;
  selected?: boolean;
}