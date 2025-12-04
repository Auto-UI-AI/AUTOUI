/**
 * Form for collecting user information and handling payment submission.
 */
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../base/card';
import { Button } from '../base/button';
import { Separator } from '../base/separator';
import { ScrollArea } from '../base/scroll-area';

interface UserInfo {
  name: string;
  email: string;
  address: string;
}

interface CheckoutFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  /** Начальные значения полей */
  initialValues?: Partial<UserInfo>;
  /** Дополнительный класс для карточки (например, для контроля ширины) */
  className?: string;
  /** Текст кнопки отправки */
  submitLabel?: string;
}

export default function CheckoutForm({
  onSubmit,
  initialValues = {},
  className = '',
  submitLabel = 'Submit',
}: CheckoutFormProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: initialValues.name ?? '',
    email: initialValues.email ?? '',
    address: initialValues.address ?? '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmit(userInfo));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`w-full border shadow-sm rounded-xl ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <CardHeader>
          <CardTitle>🧾 Checkout</CardTitle>
        </CardHeader>

        <CardContent>
          <ScrollArea className="pr-2 max-h-72">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  value={userInfo.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={userInfo.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  name="address"
                  value={userInfo.address}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Street address, city, ZIP"
                />
              </div>
            </div>
          </ScrollArea>

          <Separator className="my-4" />

          <div className="text-sm">We will only use this information to process the order.</div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
