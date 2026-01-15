import { Button } from '@/demo/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/demo/base/card';
import { Input } from '@/demo/base/input';
import { Label } from '@/demo/base/label';
import { Textarea } from '@/demo/base/textarea';

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
        <Card className="border-0 bg-card/60 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Alex Johnson" className="border-0 bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="alex@example.com" className="border-0 bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="How can we help?" className="min-h-32 border-0 bg-muted/50" />
            </div>
            <Button className="w-full">Send message</Button>
            <p className="text-xs text-muted-foreground">Demo form: messages are not actually sent.</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-muted/40 shadow-sm">
          <CardHeader>
            <CardTitle>Support details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Email</div>
              <div>support@autoui-demo.shop</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Hours</div>
              <div>Mon–Fri · 9:00–18:00</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Address</div>
              <div>Demo Street 12, Kyiv</div>
            </div>
            <div className="rounded-xl bg-background/60 p-4 text-xs">
              Tip: ask the chat for “Cart” or “Products” to render UI components.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
