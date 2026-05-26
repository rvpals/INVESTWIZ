import { themes } from '@/lib/themes';
import { useThemeStore } from '@/stores/theme-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export function PreferencesPage() {
  const { themeId, setTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Preferences</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className="relative flex flex-col items-start gap-2 rounded-lg border-2 p-3 text-left transition-all hover:scale-[1.02]"
                style={{
                  borderColor: themeId === theme.id ? theme.colors.primary : theme.colors.border,
                  backgroundColor: theme.colors.card,
                }}
              >
                {themeId === theme.id && (
                  <div
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <Check className="h-3 w-3" style={{ color: theme.colors.primaryForeground }} />
                  </div>
                )}
                <div className="flex gap-1.5">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: theme.colors.success }}
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: theme.colors.warning }}
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: theme.colors.destructive }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: theme.colors.cardForeground }}
                  >
                    {theme.name}
                  </p>
                  <div
                    className="mt-1 flex gap-1"
                  >
                    <div
                      className="h-2 w-8 rounded"
                      style={{ backgroundColor: theme.colors.background }}
                    />
                    <div
                      className="h-2 w-5 rounded"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
