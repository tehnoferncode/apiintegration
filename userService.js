export async function fetchUsers(signal) {
  const res = await fetch("https://jsonplaceholder.typicode.com/users", {
    signal,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();
  return data;
}
