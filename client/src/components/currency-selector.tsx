import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";

export default function CurrencySelector() {
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger className="w-24" data-testid="select-currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {availableCurrencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            {curr.symbol} {curr.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
