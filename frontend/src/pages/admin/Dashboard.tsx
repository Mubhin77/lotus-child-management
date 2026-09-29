import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Dashboard.css";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
}

interface Parent {
  id: number;
  first_name: string;
  last_name: string;
}

interface Classroom {
  id: number;
  name: string;
}

function Dashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          childrenResponse,
          teachersResponse,
          parentsResponse,
          classesResponse,
        ] = await Promise.all([
          api.get("/children/"),
          api.get("/teachers/"),
          api.get("/parents/"),
          api.get("/classes/"),
        ]);

        setChildren(childrenResponse.data);
        setTeachers(teachersResponse.data);
        setParents(parentsResponse.data);
        setClasses(classesResponse.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  return (
    // <div className="admin-dashboard">
    <div className="min-h-screen p-8">

      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome to Lotus CMS</p>
        </div>

        <div className="dashboard-user">
          <span>Administrator</span>
        </div>
      </header>

      <main className="dashboard-content">

        {/* Statistics */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">👧</div>
            <div>
              <p>Total Children</p>
              <h2>{children.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👩‍🏫</div>
            <div>
              <p>Total Teachers</p>
              <h2>{teachers.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍👩‍👧</div>
            <div>
              <p>Total Parents</p>
              <h2>{parents.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏫</div>
            <div>
              <p>Total Classes</p>
              <h2>{classes.length}</h2>
            </div>
          </div>

        </section>

        {/* Main content */}

        <section className="dashboard-grid">

          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Classes</h2>
              <button>View All</button>
            </div>

            {classes.length === 0 ? (
              <p>No classes found.</p>
            ) : (
              <div className="class-list">
                {classes.slice(0, 5).map((classroom) => (
                  <div className="class-item" key={classroom.id}>
                    <div>
                      <strong>{classroom.name}</strong>
                      <p>Classroom</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Recent Children</h2>
              <button>View All</button>
            </div>

            {children.length === 0 ? (
              <p>No children found.</p>
            ) : (
              <div className="child-list">
                {children.slice(0, 5).map((child) => (
                  <div className="child-item" key={child.id}>
                    <div className="avatar">
                      {child.first_name.charAt(0)}
                    </div>

                    <div>
                      <strong>
                        {child.first_name} {child.last_name}
                      </strong>
                      <p>Child</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* Quick Actions */}

        <section className="quick-actions">

          <h2>Quick Actions</h2>

          <div className="action-grid">

            <button>
              + Add Child
            </button>

            <button>
              + Add Teacher
            </button>

            <button>
              + Add Parent
            </button>

            <button>
              + Create Class
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;