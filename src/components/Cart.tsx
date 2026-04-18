import { useLanguage } from '@/context/LanguageContext';
import { CartItem } from '@/types';

interface CartProps {
  cart: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  total: number;
}

export default function Cart({ cart, onRemove, onUpdateQuantity, total }: CartProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col h-full bg-card">
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 opacity-40 text-foreground">
          <div className="text-6xl">🛒</div>
          <div>
            <p className="font-black text-[10px] uppercase tracking-[3px]">{t('cartEmpty')}</p>
            <p className="text-[10px] font-medium mt-1">{t('selectProductsStart')}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {cart.map((item, index) => (
              <div
                key={item.product?._id ? String(item.product._id) : `item-${index}`}
                className="flex items-center justify-between p-4 border-b border-card-border hover:bg-pos-accent/5 transition-colors group"
              >
                <div className="flex-1 min-w-0 pr-4 text-foreground">
                  <h3 className="font-black text-[11px] uppercase tracking-tight truncate">
                    {item.product?.name || 'Unknown Item'}
                  </h3>
                  <p className="text-[10px] font-bold text-pos-accent mt-0.5">
                    Rs. {(item.product?.sellingPrice || item.product?.price || 0).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-background rounded-lg p-1">
                    <button
                      onClick={() => item.product?._id && onUpdateQuantity(item.product._id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-card hover:shadow-sm text-foreground transition-all font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-[11px] font-black text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => item.product?._id && onUpdateQuantity(item.product._id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-card hover:shadow-sm text-foreground transition-all font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="w-24 text-right">
                    <p className="text-[11px] font-black text-foreground tracking-tight">
                      Rs. {((item.product?.sellingPrice || item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => item.product?._id && onRemove(item.product._id)}
                    className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 opacity-100"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}