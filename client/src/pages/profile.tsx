import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile & Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where user account details and preferences will be managed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
