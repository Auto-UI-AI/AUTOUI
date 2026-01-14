import { Card, CardContent, CardHeader, CardTitle } from '@/demo/base/card';

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-0 bg-card/60 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>About AUTOUI Atelier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              We’re a demo storefront built for showcasing a modern ecommerce UI: fast filters, a clean cart,
              and an AI-powered assistant that can render components.
            </p>
            <p>
              Our “collections” are curated basics—minimal silhouettes, timeless colors, and everyday comfort.
              Everything here is mock data for the demo, but the UX is real.
            </p>
            <p>
              Want to explore? Use the chat to ask for “Products”, “Cart”, “Wishlist”, or “Last order” and see
              UI components appear.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-muted/40 shadow-sm">
          <CardHeader>
            <CardTitle>Store principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="font-medium">Quality basics</div>
              <div className="text-muted-foreground">Fewer items, better fits.</div>
            </div>
            <div>
              <div className="font-medium">Simple returns</div>
              <div className="text-muted-foreground">Clear policy, fast refunds.</div>
            </div>
            <div>
              <div className="font-medium">Responsible packaging</div>
              <div className="text-muted-foreground">Less waste, more reuse.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
