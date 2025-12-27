import { Product, RepricerRule, Shipment, Promotion } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'MCRO-001',
    title: 'Gaming Mouse Wireless rgb light lightweight',
    optimizedTitle: 'MCRO Pro Wireless Gaming Mouse - Ultra-Lightweight 65g, RGB Chroma, 20k DPI Sensor',
    price: 89.99,
    stock: 142,
    image: 'https://picsum.photos/100/100?random=1',
    status: 'active',
  },
  {
    id: '2',
    sku: 'MCRO-002',
    title: 'Mechanical Keyboard blue switches clicky',
    optimizedTitle: 'MCRO Mechanical Keyboard - Blue Switches, Tactile Clicky, Compact 60% Layout for Esports',
    price: 129.50,
    stock: 45,
    image: 'https://picsum.photos/100/100?random=2',
    status: 'active',
  },
  {
    id: '3',
    sku: 'MCRO-003',
    title: 'Headset stand holder aluminum',
    optimizedTitle: 'MCRO Aluminum Headset Stand - Universal Fit, Non-Slip Base, Matte Black Finish',
    price: 24.99,
    stock: 890,
    image: 'https://picsum.photos/100/100?random=3',
    status: 'active',
  },
  {
    id: '4',
    sku: 'MCRO-004',
    title: 'Desk mat large black waterproof',
    optimizedTitle: 'MCRO XXL Gaming Desk Mat - Waterproof, Anti-Fray Stitching, Stealth Black (900x400mm)',
    price: 19.99,
    stock: 210,
    image: 'https://picsum.photos/100/100?random=4',
    status: 'draft',
  },
  {
    id: '5',
    sku: 'MCRO-005',
    title: 'Webcam 1080p streaming camera',
    optimizedTitle: 'MCRO StreamCam 1080p 60FPS - Auto-Focus, Low Light Correction, Dual Mic for Streaming',
    price: 79.99,
    stock: 12,
    image: 'https://picsum.photos/100/100?random=5',
    status: 'active',
  },
];

export const REPRICER_RULES: RepricerRule[] = [
  {
    id: '1',
    name: 'Velocity Surge',
    type: 'VELOCITY',
    active: true,
    description: 'Aggressively matches Buy Box when sales velocity drops below 10 units/day.',
  },
  {
    id: '2',
    name: 'Liquidation Protocol',
    type: 'LIQUIDATION',
    active: false,
    description: 'Drops price by 5% every 24h until inventory clears. Use with caution.',
  },
  {
    id: '3',
    name: 'Profit Maximizer',
    type: 'PROFIT',
    active: true,
    description: 'Increments price by $0.50 when competitor stock is low.',
  },
  {
    id: '4',
    name: 'Night Owl',
    type: 'PROFIT',
    active: false,
    description: 'Increases margins between 2 AM and 6 AM when competition is dormant.',
  },
];

export const SHIPMENTS: Shipment[] = [
  { id: 'S-1024', destination: 'CLT2', status: 'RECEIVING', items: 400, eta: 'Today' },
  { id: 'S-1025', destination: 'LGB8', status: 'STUCK', items: 1250, eta: 'Delayed (3 days)' },
  { id: 'S-1026', destination: 'AVP1', status: 'IN_TRANSIT', items: 200, eta: 'Nov 14' },
  { id: 'S-1027', destination: 'JFK8', status: 'CLOSED', items: 850, eta: '-' },
  { id: 'S-1028', destination: 'LAX9', status: 'STUCK', items: 50, eta: 'Delayed (1 week)' },
];

export const PROMOTIONS: Promotion[] = [
  { id: '1', date: 12, title: 'Black Friday Warmup', type: 'FLASH' },
  { id: '2', date: 24, title: 'Cyber Monday', type: 'COUPON' },
  { id: '3', date: 28, title: 'Inventory Clear', type: 'FLASH' },
];

export const FINANCIAL_DATA = [
  { name: 'Mon', revenue: 4000, profit: 2400, cost: 1600 },
  { name: 'Tue', revenue: 3000, profit: 1398, cost: 1602 },
  { name: 'Wed', revenue: 2000, profit: 800, cost: 1200 },
  { name: 'Thu', revenue: 2780, profit: 1908, cost: 872 },
  { name: 'Fri', revenue: 1890, profit: 480, cost: 1410 },
  { name: 'Sat', revenue: 2390, profit: 1200, cost: 1190 },
  { name: 'Sun', revenue: 3490, profit: 2100, cost: 1390 },
];
