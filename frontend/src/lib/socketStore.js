export const socketState = {
  pipeline: { new: 0, contacted: 0, qualified: 0, booked: 0 },
  connected: false,
  mode: "TEST",
  analytics: {
    total: 0,
    processed: 0,
    remaining: 0,
  },
  notifications: [],
};
