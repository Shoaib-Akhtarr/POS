import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();

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
          <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'Cash' ? 'text-pos-accent' : 'text-black'}`}>
            {t('cash')}
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
          <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'Credit' ? 'text-pos-accent' : 'text-black'}`}>
            {t('khata')}
          </span>
          {paymentMethod === 'Credit' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-pos-accent rounded-full"></div>
          )}
          {!isCustomerSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/10 rounded-xl">
              <span className="text-[7px] font-black text-black bg-card px-1 py-0.5 rounded shadow-sm border border-card-border uppercase tracking-tighter">{t('selectCustomerFirst')}</span>
            </div>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {setDiscountAmount && (
          <div className="relative group mb-8">
            <label className="absolute -top-2 left-3 bg-card px-1 text-[8px] font-black text-black uppercase tracking-widest z-10">
              {t('discountLabel')} (Rs)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-bold text-sm">Rs.</span>
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

        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">{t('payingNow')} (Rs)</label>
            <span className="text-[9px] font-bold text-pos-accent/60 uppercase tracking-tighter">
              Max: Rs. {(total + (previousDues < 0 ? Math.abs(previousDues) : 0)).toLocaleString()}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              disabled={paymentMethod === 'Credit' && !isCustomerSelected}
              className={`w-full px-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-4 transition-all font-black text-xl text-foreground tracking-tighter sm:text-2xl ${parseFloat(amountPaid) > (total + (previousDues < 0 ? Math.abs(previousDues) : 0)) ? 'border-danger focus:ring-danger/10' : 'border-card-border focus:ring-pos-accent/10 focus:border-pos-accent'}`}
              placeholder="0.00"
            />
            {parseFloat(amountPaid) > (total + (previousDues < 0 ? Math.abs(previousDues) : 0)) && (
              <div className="mt-2 flex flex-col gap-1.5 p-3 rounded-xl bg-danger/5 border border-danger/10 animate-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2 text-danger">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none">{t('exceedsBalance')}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setAmountPaid((total + (previousDues < 0 ? Math.abs(previousDues) : 0)).toString())}
                  className="text-[8px] font-black uppercase py-1 px-2 bg-danger text-white rounded-lg self-start hover:bg-danger/90 transition-all active:scale-95 shadow-sm"
                >
                  {t('autoAdjust')}
                </button>
              </div>
            )}
          </div>
        </div>

        {paymentMethod === 'Credit' && (
          <div className="p-4 bg-pos-accent/5 rounded-xl border border-pos-accent/10">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-black">{t('remainingKhata')}</span>
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
