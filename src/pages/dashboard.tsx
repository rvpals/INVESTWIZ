import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here's your investment overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0.00</p>
            <p className="text-xs text-muted-foreground">+$0.00 (0.00%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Day Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0.00</p>
            <p className="text-xs text-muted-foreground">0.00%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0.00</p>
            <p className="text-xs text-muted-foreground">0.00%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">0 holdings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No portfolios yet. Create one to start tracking your investments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
