import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchUsers } from "../services/userService";
import "../styles/users.css";

function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastFetched, setLastFetched] = useState("");

  // ✅ to cancel request if component unmounts
  const abortRef = useRef(null);

  // ✅ Real dashboard behavior: manual fetch on button click
  const loadUsers = async () => {
    try {
      setStatus("loading");
      setError("");

      // cancel previous request if any
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const data = await fetchUsers(abortRef.current.signal);
      setUsers(data);
      setStatus("success");
      setLastFetched(new Date().toLocaleString());
    } catch (err) {
      if (err.name === "AbortError") return; // ignored
      setStatus("error");
      setError(err.message || "Something went wrong");
    }
  };

  const refreshUsers = () => {
    // same logic, but for “Refresh” UX
    loadUsers();
  };

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ✅ Search filter (real feature)
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const clearAll = () => {
    setUsers([]);
    setSearch("");
    setError("");
    setStatus("idle");
    setLastFetched("");
  };

  return (
    <div className="page">
      <div className="card">
        <div className="header">
          <div>
            <h2 className="title">👤 Users Dashboard</h2>
            <p className="subtitle">
              Real admin flow: click <b>Load Users</b>, search, refresh, handle
              loading & errors.
            </p>
          </div>

          <div className="actions">
            <button
              className="btn primary"
              onClick={loadUsers}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Loading..." : "Load Users"}
            </button>

            <button
              className="btn"
              onClick={refreshUsers}
              disabled={status === "loading" || users.length === 0}
            >
              Refresh
            </button>

            <button className="btn danger" onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="search"
            type="text"
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={users.length === 0}
          />

          <div className="meta">
            <span className="badge">
              Total: <b>{users.length}</b>
            </span>
            <span className="badge">
              Showing: <b>{filteredUsers.length}</b>
            </span>
            <span className="badge">
              Status: <b>{status}</b>
            </span>
          </div>
        </div>

        {lastFetched && (
          <div className="fetched">
            ✅ Last fetched: <b>{lastFetched}</b>
          </div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="state-box">
            <div className="loader"></div>
            <div>
              <div className="state-title">Fetching users from API...</div>
              <div className="state-sub">Please wait (real dashboard flow)</div>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="error-box">
            <div className="error-title">❌ Error</div>
            <div className="error-text">{error}</div>
            <button className="btn primary" onClick={loadUsers}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {status === "idle" && (
          <div className="empty">
            <div className="empty-title">No data loaded yet</div>
            <div className="empty-sub">
              Click <b>Load Users</b> to fetch from API.
            </div>
          </div>
        )}

        {/* Data table */}
        {status === "success" && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{idx + 1}</td>
                    <td className="bold">{u.name}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.address?.city}</td>
                    <td>{u.company?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="empty small">
                <div className="empty-title">No results found</div>
                <div className="empty-sub">Try a different search keyword.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersDashboard;
