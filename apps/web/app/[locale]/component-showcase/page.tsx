import { PageHeader, PageWrapper } from '@repo/design-system';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';

/**
 * Component Showcase Page
 *
 * Demonstrates the PageWrapper and PageHeader components
 * with various configuration options and use cases.
 */
export default function ComponentShowcasePage() {
  return (
    <PageWrapper variant="medium" padding="normal">
      <PageHeader
        title="Component Showcase"
        description="Demonstration of PageWrapper and PageHeader components with various configurations"
        variant="center"
        actions={
          <div className='flex justify-center gap-4'>
            <Button>Primary Action</Button>
            <Button variant="outline">Secondary Action</Button>
          </div>
        }
      />

      <div className="space-y-12">
        {/* Variants Section */}
        <section>
          <h2 className='mb-6 font-semibold text-2xl'>Layout Variants</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Narrow (768px)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Optimized for long-form reading content like blog posts and articles.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medium (896px)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Default variant for most content pages. Balanced width for readability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wide (1280px)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Best for dashboards, data tables, and layouts requiring more horizontal space.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Full Width</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  No max-width constraint. Use for landing pages or custom layouts.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Padding Options */}
        <section>
          <h2 className='mb-6 font-semibold text-2xl'>Padding Options</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {['None', 'Tight', 'Normal', 'Relaxed'].map((option) => (
              <Card key={option}>
                <CardHeader>
                  <CardTitle className="text-base">{option}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-xs">
                    {option === 'None' && 'No vertical padding'}
                    {option === 'Tight' && '32px vertical padding'}
                    {option === 'Normal' && '48px → 64px (default)'}
                    {option === 'Relaxed' && '64px → 80px → 96px'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Usage Example */}
        <section>
          <h2 className='mb-6 font-semibold text-2xl'>Usage Example</h2>
          <Card>
            <CardHeader>
              <CardTitle>Basic Page Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                <code>{`import { PageWrapper, PageHeader } from '@repo/design-system';

export default function MyPage() {
  return (
    <PageWrapper variant="medium" padding="normal">
      <PageHeader
        title="Page Title"
        description="Page description"
      />
      <div>{/* Page content */}</div>
    </PageWrapper>
  );
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Features */}
        <section>
          <h2 className='mb-6 font-semibold text-2xl'>Features</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Semantic HTML', desc: 'Renders as <main>, <article>, <section>, or <div>' },
              { title: 'Responsive', desc: 'Mobile-first design with adaptive spacing' },
              { title: 'Accessible', desc: 'ARIA landmarks and keyboard navigation' },
              { title: 'TypeScript', desc: 'Fully typed with exported interfaces' },
              { title: 'Zero JS', desc: 'Pure CSS/HTML with no client-side JavaScript' },
              { title: 'Customizable', desc: 'Accepts className for additional styling' },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}