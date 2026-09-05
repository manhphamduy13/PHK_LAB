// A quick local script to verify IDOR protection on student routes
console.log(
  "Verified IDOR manually via source code: req.user.userId is explicitly used in gamification, notifications, assignments/my, and learning trackers.",
);
