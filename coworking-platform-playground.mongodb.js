/* global use, db */
// MongoDB Playground for Coworking Platform
// Essential collections and operations

use('coworking_platform');

// 1. MEMBERS
const members = db.getCollection('members');
members.drop();
members.createIndexes([
  { key: { email: 1 }, unique: true },
  { key: { status: 1 } },
  { key: { membershipType: 1 } }
]);

// 2. BOOKINGS
const bookings = db.getCollection('bookings');
bookings.drop();
bookings.createIndexes([
  { key: { memberId: 1 } },
  { key: { spaceId: 1 } },
  { key: { startTime: 1 } },
  { key: { status: 1 } }
]);

// 3. SPACES
const spaces = db.getCollection('spaces');
spaces.drop();
spaces.createIndexes([
  { key: { type: 1 } },
  { key: { capacity: 1 } },
  { key: { isActive: 1 } }
]);

// 4. MEMBERSHIPS
const memberships = db.getCollection('memberships');
memberships.drop();
memberships.createIndexes([
  { key: { memberId: 1 } },
  { key: { status: 1 } },
  { key: { endDate: 1 } }
]);

// 5. PAYMENTS
const payments = db.getCollection('payments');
payments.drop();
payments.createIndexes([
  { key: { memberId: 1 } },
  { key: { bookingId: 1 } },
  { key: { status: 1 } },
  { key: { date: -1 } }
]);

// 6. AMENITIES
const amenities = db.getCollection('amenities');
amenities.drop();
amenities.createIndexes([
  { key: { category: 1 } },
  { key: { isActive: 1 } }
]);

// 7. MAINTENANCE
const maintenance = db.getCollection('maintenance');
maintenance.drop();
maintenance.createIndexes([
  { key: { spaceId: 1 } },
  { key: { status: 1 } },
  { key: { scheduledDate: 1 } }
]);

// 8. NOTIFICATIONS
const notifications = db.getCollection('notifications');
notifications.drop();
notifications.createIndexes([
  { key: { userId: 1 } },
  { key: { read: 1 } },
  { key: { createdAt: -1 } }
]);

// Sample Data Insertion Functions
function insertSampleData() {
  // Insert sample member
  const member = {
    _id: new ObjectId(),
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    status: "active",
    membershipType: "premium",
    joinDate: new Date(),
    lastVisit: new Date(),
    totalVisits: 5
  };
  members.insertOne(member);

  // Insert sample space
  const space = {
    _id: new ObjectId(),
    name: "Conference Room A",
    type: "meeting_room",
    capacity: 6,
    hourlyRate: 25,
    isActive: true
  };
  spaces.insertOne(space);

  // Insert sample booking
  const booking = {
    _id: new ObjectId(),
    memberId: member._id,
    spaceId: space._id,
    startTime: new Date("2024-03-15T09:00:00Z"),
    endTime: new Date("2024-03-15T11:00:00Z"),
    status: "confirmed"
  };
  bookings.insertOne(booking);

  console.log("Sample data inserted successfully!");
}

// Uncomment to insert sample data
// insertSampleData();

// Example Queries
function getActiveMembers() {
  return members.find({ status: "active" }).toArray();
}

function getUpcomingBookings() {
  return bookings.find({
    startTime: { $gte: new Date() },
    status: { $in: ["confirmed", "pending"] }
  }).sort({ startTime: 1 }).toArray();
}

function getMemberBookings(memberId) {
  return bookings.find({ memberId: new ObjectId(memberId) })
    .sort({ startTime: -1 })
    .toArray();
}

// Export functions for use in MongoDB Shell
module.exports = {
  getActiveMembers,
  getUpcomingBookings,
  getMemberBookings
};
