import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TripsPage() {
  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>My Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where the list of all user trips will be displayed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
