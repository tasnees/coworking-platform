'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  workspace: {
    name: string;
    type: string;
  };
}

export function UserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings/user');
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Update the UI by removing the cancelled booking
      setBookings(bookings.filter(booking => booking.id !== bookingId));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You don't have any bookings yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Your Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium">{booking.workspace.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.startTime), 'PPPpp')} - {format(new Date(booking.endTime), 'pp')}
                </p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              {booking.status === 'confirmed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancel(booking.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
