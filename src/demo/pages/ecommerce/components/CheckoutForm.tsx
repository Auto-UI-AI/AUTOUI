import React, { useMemo, useState } from 'react';

import { Button } from '@/demo/base/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/demo/base/card';
import { Input } from '@/demo/base/input';
import { Label } from '@/demo/base/label';
import { Textarea } from '@/demo/base/textarea';

export interface UserInfo {
  name: string;
  email: string;
  address: string;
}

interface CheckoutFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isSubmitting = false, submitLabel = 'Place order' }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    address: '',
  });

  const canSubmit = useMemo(() => {
    return Boolean(userInfo.name.trim() && userInfo.email.trim() && userInfo.address.trim()) && !isSubmitting;
  }, [userInfo, isSubmitting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: userInfo.name.trim(),
      email: userInfo.email.trim(),
      address: userInfo.address.trim(),
    });
  };

  return (
    <Card className="border-0 bg-card/60 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-name">Name</Label>
            <Input
              id="checkout-name"
              name="name"
              placeholder="Jane Doe"
              className="border-0 bg-muted/50"
              value={userInfo.name}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-email">Email</Label>
            <Input
              id="checkout-email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              className="border-0 bg-muted/50"
              value={userInfo.email}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-address">Shipping address</Label>
            <Textarea
              id="checkout-address"
              name="address"
              placeholder="Street, city, postal code"
              className="border-0 bg-muted/50"
              value={userInfo.address}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <CardFooter className="px-0 pb-0">
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isSubmitting ? 'Placing order…' : submitLabel}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
