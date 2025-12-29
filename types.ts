export enum Tab {
    INVENTORY = 'INVENTORY',
    REPRICER = 'REPRICER',
    PROMOTIONS = 'PROMOTIONS',
    FINANCIALS = 'FINANCIALS',
    FULFILLMENT = 'FULFILLMENT',
    ANALYTICS = 'ANALYTICS',
    SETTINGS = 'SETTINGS',
  }
  
  export interface Product {
    id: string;
    sku: string;
    title: string;
    description: string;
    optimizedTitle?: string;
    optimizedDescription?: string;
    price: number;
    stock: number;
    image: string;
    status: 'active' | 'draft';
  }
  
  export interface RepricerRule {
    id: string;
    name: string;
    type: 'VELOCITY' | 'LIQUIDATION' | 'PROFIT';
    active: boolean;
    description: string;
  }
  
  export interface Shipment {
    id: string;
    destination: string;
    status: 'IN_TRANSIT' | 'RECEIVING' | 'STUCK' | 'CLOSED';
    items: number;
    eta: string;
  }
  
  export interface Promotion {
    id: string;
    date: number; // Keep for backward compat with constants, but UI will use full dates
    title: string;
    type: 'FLASH' | 'COUPON';
    // New fields for logic
    startTime?: Date;
    endTime?: Date;
    affiliatesNotified?: boolean;
  }