'use client';

interface PaymentMethodProps {
  paymentMethod: 'Cash' | 'Credit';
  setPaymentMethod: (method: 'Cash' | 'Credit') => void;
  amountPaid: string;
  setAmountPaid: (amount: string) => void;
  discountAmount?: string;
  setDiscountAmount?: (amount: string) => void;
  total: number;
  isCustomerSelected: boolean;
  previousDues?: number;
}

export default function PaymentMethod({
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  discountAmount = '',
  setDiscountAmount,
  total,
  isCustomerSelected,
  previousDues = 0
}: PaymentMethodProps) {

  const handleMethodChange = (method: 'Cash' | 'Credit') => {
    setPaymentMethod(method);
    if (method === 'Cash') {
      setAmountPaid(total > 0 ? total.toString() : '');
    } else {
      setAmountPaid('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {/* Cash Card */}
        <button
          type="button"
          onClick={() => handleMethodChange('Cash')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'Cash'
            ? 'border-pos-accent bg-pos-accent/5'
            : 'border-card-border bg-card hover:border-pos-accent/30 text-foreground'
            }`}
        >
          <span className="text-2xl mb-1">💵</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'Cash' ? 'text-pos-accent' : 'text-muted'}`}>
            Cash
          </span>
          {paymentMethod === 'Cash' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-pos-accent rounded-full"></div>
          )}
        </button>

        {/* Khata Card */}
        <button
          type="button"
          disabled={!isCustomerSelected}
          onClick={() => handleMethodChange('Credit')}
          className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${!isCustomerSelected
            ? 'opacity-40 cursor-not-allowed border-dashed bg-background'
            : paymentMethod === 'Credit'
              ? 'border-pos-accent bg-pos-accent/5'
              : 'border-card-border bg-card hover:border-pos-accent/30 text-foreground'
            }`}
        >
          <span className="text-2xl mb-1">📓</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'Credit' ? 'text-pos-accent' : 'text-muted'}`}>
            Khata
          </span>
          {paymentMethod === 'Credit' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-pos-accent rounded-full"></div>
          )}
          {!isCustomerSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/10 rounded-xl">
              <span className="text-[7px] font-black text-muted-foreground bg-card px-1 py-0.5 rounded shadow-sm border border-card-border uppercase tracking-tighter">Select Customer</span>
            </div>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {setDiscountAmount && (
          <div className="relative group mb-8">
            <label className="absolute -top-2 left-3 bg-card px-1 text-[8px] font-black text-muted-foreground uppercase tracking-widest z-10">
              Discount (Rs)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">Rs.</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(e) => {
                  setDiscountAmount(e.target.value);
                  // Update amountPaid intelligently if cash
                  if (paymentMethod === 'Cash') {
                    const currentTotal = total; // Already incorporates current discount
                    const newDiscount = parseFloat(e.target.value) || 0;
                    const oldDiscount = parseFloat(discountAmount) || 0;
                    const baseSubtotal = currentTotal + oldDiscount;
                    setAmountPaid(Math.max(0, baseSubtotal - newDiscount).toString());
                  }
                }}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/5 focus:border-pos-accent transition-all text-sm font-black tracking-tight text-foreground"
              />
            </div>
          </div>
        )}

        <div className="relative group">
          <label className="absolute -top-2 left-3 bg-card px-1 text-[8px] font-black text-muted-foreground uppercase tracking-widest z-10">
            Paying Now (Rs)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">Rs.</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-4 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/5 focus:border-pos-accent transition-all text-lg font-black tracking-tight text-foreground"
            />
          </div>
        </div>

        {paymentMethod === 'Credit' && (
          <div className="p-4 bg-pos-accent/5 rounded-xl border border-pos-accent/10">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-muted-foreground">Remaining to Khata</span>
              <span className="text-pos-accent">
                Rs. {Math.abs(Math.min(0, previousDues - total + (parseFloat(amountPaid) || 0))).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}