import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { ReservationWithDetails, Branch } from '../../types';
import { formatDate, escapeHtml } from '../../utils/helpers';

interface ReservationsPageProps {
  reservations: ReservationWithDetails[];
  branches: Branch[];
  filter?: string;
  stats: {
    pending: number;
    confirmed: number;
    today: number;
    upcoming: number;
  };
}

function getReservationStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'success';
    case 'cancelled': return 'error';
    case 'completed': return 'info';
    case 'no_show': return 'error';
    default: return 'default';
  }
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export const AdminReservationsPage: FC<ReservationsPageProps> = ({ reservations, branches, filter, stats }) => {
  const statusFilters = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

  return (
    <AdminLayout title="Reservations" currentPath="/admin/reservations">
      <div class="admin-header">
        <h1 class="admin-title">Table Reservations</h1>
      </div>

      {/* Stats Cards */}
      <div class="grid grid-4" style="margin-bottom: 24px;">
        <div class="card stat-card">
          <div class="stat-value" style="color: var(--warning);">{stats.pending}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value" style="color: var(--success);">{stats.confirmed}</div>
          <div class="stat-label">Confirmed</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value" style="color: var(--primary);">{stats.today}</div>
          <div class="stat-label">Today</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value" style="color: var(--info);">{stats.upcoming}</div>
          <div class="stat-label">Upcoming</div>
        </div>
      </div>

      {/* Status Filters */}
      <div class="category-nav" style="margin-bottom: 24px;">
        {statusFilters.map(status => (
          <a
            href={`/admin/reservations${status !== 'all' ? `?filter=${status}` : ''}`}
            class={`category-btn ${filter === status || (!filter && status === 'all') ? 'active' : ''}`}
          >
            {status === 'no_show' ? 'No Show' : status.charAt(0).toUpperCase() + status.slice(1)}
          </a>
        ))}
      </div>

      {reservations.length > 0 ? (
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Date & Time</th>
                <th>Party Size</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr>
                  <td style="font-weight: 600;">#{res.id}</td>
                  <td>
                    <div style="font-weight: 500;">
                      {escapeHtml(res.customer_name || res.guest_name || 'Unknown')}
                    </div>
                    {res.customer_id && (
                      <div class="text-muted" style="font-size: 11px;">
                        <a href={`/admin/customers/${res.customer_id}`}>Member</a>
                      </div>
                    )}
                    {!res.customer_id && (
                      <div class="text-muted" style="font-size: 11px;">Guest</div>
                    )}
                  </td>
                  <td>
                    <div style="font-size: 13px;">{escapeHtml(res.customer_phone || res.guest_phone || '-')}</div>
                    {(res.customer_email || res.guest_email) && (
                      <div class="text-muted" style="font-size: 11px;">{escapeHtml(res.customer_email || res.guest_email || '')}</div>
                    )}
                  </td>
                  <td>{escapeHtml(res.branch_name)}</td>
                  <td>
                    <div style="font-weight: 500;">{formatDate(res.reservation_date)}</div>
                    <div class="text-muted" style="font-size: 12px;">{formatTime(res.reservation_time)}</div>
                  </td>
                  <td style="text-align: center;">
                    <span style="font-size: 18px;">{res.party_size}</span>
                    <div class="text-muted" style="font-size: 11px;">{res.party_size === 1 ? 'person' : 'people'}</div>
                  </td>
                  <td style="max-width: 150px;">
                    {res.notes ? (
                      <div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={escapeHtml(res.notes)}>
                        {escapeHtml(res.notes)}
                      </div>
                    ) : (
                      <span class="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <span class={`status ${getReservationStatusColor(res.status)}`}>
                      {res.status === 'no_show' ? 'No Show' : res.status}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button
                        class="btn btn-ghost btn-sm"
                        onclick={`openReservationModal(${JSON.stringify(res).replace(/"/g, '&quot;')})`}
                      >
                        View
                      </button>
                      {(res.status === 'pending' || res.status === 'confirmed') && (
                        <select
                          onchange={`updateReservationStatus(${res.id}, this.value)`}
                          class="form-select"
                          style="padding: 6px 10px; font-size: 12px; width: auto;"
                        >
                          <option value="">Update</option>
                          {res.status === 'pending' && <option value="confirmed">Confirm</option>}
                          <option value="completed">Complete</option>
                          <option value="no_show">No Show</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3 class="empty-state-title">No Reservations Found</h3>
          <p class="empty-state-text">
            {filter ? `No reservations with status "${filter}"` : 'Reservations will appear here when customers book tables.'}
          </p>
        </div>
      )}

      {/* Reservation Detail Modal */}
      <div id="reservationModal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h3>Reservation Details</h3>
            <button class="modal-close" onclick="closeReservationModal()">&times;</button>
          </div>
          <div class="modal-body" id="reservationModalContent">
            {/* Content populated by JS */}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeReservationModal()">Close</button>
            <button class="btn btn-success" id="modalConfirmBtn" onclick="confirmFromModal()" style="display: none;">Confirm</button>
            <button class="btn btn-error" id="modalCancelBtn" onclick="cancelFromModal()" style="display: none;">Cancel</button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        let currentReservation = null;

        function formatTime(time) {
          const [hours, minutes] = time.split(':').map(Number);
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          return displayHours + ':' + minutes.toString().padStart(2, '0') + ' ' + period;
        }

        function formatDate(dateStr) {
          const date = new Date(dateStr + 'T00:00:00');
          return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }

        function getStatusBadge(status) {
          const colors = {
            pending: 'warning',
            confirmed: 'success',
            cancelled: 'error',
            completed: 'info',
            no_show: 'error'
          };
          const label = status === 'no_show' ? 'No Show' : status.charAt(0).toUpperCase() + status.slice(1);
          return '<span class="status ' + (colors[status] || 'default') + '">' + label + '</span>';
        }

        function openReservationModal(reservation) {
          currentReservation = reservation;

          const guestName = reservation.customer_name || reservation.guest_name || 'Unknown';
          const phone = reservation.customer_phone || reservation.guest_phone || '-';
          const email = reservation.customer_email || reservation.guest_email || '-';

          let content = \`
            <div style="display: grid; gap: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label class="form-label">Guest Name</label>
                  <div style="font-weight: 600; font-size: 16px;">\${guestName}</div>
                  \${reservation.customer_id ? '<div class="text-muted" style="font-size: 12px;">Registered Member</div>' : '<div class="text-muted" style="font-size: 12px;">Guest Booking</div>'}
                </div>
                <div>
                  <label class="form-label">Status</label>
                  <div>\${getStatusBadge(reservation.status)}</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label class="form-label">Phone</label>
                  <div>\${phone}</div>
                </div>
                <div>
                  <label class="form-label">Email</label>
                  <div>\${email}</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label class="form-label">Restaurant</label>
                  <div style="font-weight: 500;">\${reservation.branch_name}</div>
                </div>
                <div>
                  <label class="form-label">Party Size</label>
                  <div style="font-weight: 500;">\${reservation.party_size} \${reservation.party_size === 1 ? 'person' : 'people'}</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label class="form-label">Date</label>
                  <div style="font-weight: 500;">\${formatDate(reservation.reservation_date)}</div>
                </div>
                <div>
                  <label class="form-label">Time</label>
                  <div style="font-weight: 500;">\${formatTime(reservation.reservation_time)}</div>
                </div>
              </div>

              \${reservation.notes ? \`
                <div>
                  <label class="form-label">Guest Notes / Special Requests</label>
                  <div style="background: var(--bg-alt); padding: 12px; border-radius: 8px;">\${reservation.notes}</div>
                </div>
              \` : ''}

              \${reservation.admin_notes ? \`
                <div>
                  <label class="form-label">Admin Notes</label>
                  <div style="background: var(--warning-bg); padding: 12px; border-radius: 8px; color: var(--warning-dark);">\${reservation.admin_notes}</div>
                </div>
              \` : ''}

              <div>
                <label class="form-label">Add Admin Note</label>
                <textarea id="adminNoteInput" class="form-input" rows="2" placeholder="Internal notes about this reservation..."></textarea>
                <button class="btn btn-secondary btn-sm mt-2" onclick="saveAdminNote()">Save Note</button>
              </div>
            </div>
          \`;

          document.getElementById('reservationModalContent').innerHTML = content;

          // Show/hide action buttons based on status
          const confirmBtn = document.getElementById('modalConfirmBtn');
          const cancelBtn = document.getElementById('modalCancelBtn');

          if (reservation.status === 'pending') {
            confirmBtn.style.display = 'inline-flex';
            cancelBtn.style.display = 'inline-flex';
          } else if (reservation.status === 'confirmed') {
            confirmBtn.style.display = 'none';
            cancelBtn.style.display = 'inline-flex';
          } else {
            confirmBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
          }

          document.getElementById('reservationModal').style.display = 'flex';
        }

        function closeReservationModal() {
          document.getElementById('reservationModal').style.display = 'none';
          currentReservation = null;
        }

        async function updateReservationStatus(id, status) {
          if (!status) return;

          const statusLabels = {
            confirmed: 'confirm',
            cancelled: 'cancel',
            completed: 'mark as completed',
            no_show: 'mark as no-show'
          };

          if (!confirm('Are you sure you want to ' + statusLabels[status] + ' this reservation?')) return;

          try {
            const res = await fetch('/api/reservations/' + id + '/status', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to update status');
            }
          } catch (err) {
            alert('Failed to update status');
          }
        }

        function confirmFromModal() {
          if (currentReservation) {
            updateReservationStatus(currentReservation.id, 'confirmed');
          }
        }

        function cancelFromModal() {
          if (currentReservation) {
            updateReservationStatus(currentReservation.id, 'cancelled');
          }
        }

        async function saveAdminNote() {
          if (!currentReservation) return;

          const note = document.getElementById('adminNoteInput').value.trim();
          if (!note) {
            alert('Please enter a note');
            return;
          }

          try {
            const res = await fetch('/api/reservations/' + currentReservation.id, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ admin_notes: note })
            });

            if (res.ok) {
              alert('Note saved');
              location.reload();
            } else {
              alert('Failed to save note');
            }
          } catch (err) {
            alert('Failed to save note');
          }
        }

        // Close modal when clicking overlay
        document.getElementById('reservationModal').addEventListener('click', function(e) {
          if (e.target === this) {
            closeReservationModal();
          }
        });
      `}} />

      <style>{`
        .stat-card {
          text-align: center;
          padding: 20px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
        }
        .stat-label {
          color: var(--text-muted);
          font-size: 14px;
          margin-top: 4px;
        }
      `}</style>
    </AdminLayout>
  );
};
