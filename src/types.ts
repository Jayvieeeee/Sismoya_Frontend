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
  id?: number;
  type?: string;
  liters?: number;
  price?: number;
  quantity: number;
  qty?: number; 
  total_price?: number;
  image_url?: string;
  selected?: boolean;
}