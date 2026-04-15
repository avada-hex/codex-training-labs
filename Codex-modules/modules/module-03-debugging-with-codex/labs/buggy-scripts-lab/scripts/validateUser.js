const userPayload = process.argv[2];
let user;

if (userPayload) {
  try {
    user = JSON.parse(userPayload);
  } catch (error) {
    console.error("Invalid user payload JSON:", error.message);
    process.exitCode = 1;
  }
}

function describeAccess(u) {
  const roles = u?.roles ?? [];
  return roles.map((role) => role.toUpperCase()).join(", ");
}

if (!user) {
  console.log("No user payload supplied. Provide a JSON object with a 'roles' array.");
} else {
  console.log("User access:", describeAccess(user));
}
