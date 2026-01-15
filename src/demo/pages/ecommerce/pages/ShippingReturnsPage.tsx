import { Card, CardContent, CardHeader, CardTitle } from '@/demo/base/card';

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 bg-card/60 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>This is a demo shop. Shipping information is here to make the UI feel realistic.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Standard: 3–5 business days</li>
              <li>Express: 1–2 business days</li>
              <li>International: 7–14 business days</li>
            </ul>
            <p>Orders are processed Mon–Fri. You’ll see a mock ETA after checkout.</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-muted/40 shadow-sm">
          <CardHeader>
            <CardTitle>Returns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Return window: 30 days from delivery.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Items must be unworn with tags attached</li>
              <li>Refunds go to original payment method</li>
              <li>Exchange options depend on stock</li>
            </ul>
            <p>For the demo, returns aren’t actually processed—this page is just for completeness.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
