import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../../components/Layout';
import type { LoyaltyChallenge, CustomerSegment } from '../../../types';
import { escapeHtml, formatDate } from '../../../utils/helpers';

const CHALLENGE_TYPES = [
  { id: 'spend', name: 'Spend Goal', icon: '💰', desc: 'Spend X amount' },
  { id: 'visits', name: 'Visit Streak', icon: '📆', desc: 'Visit X times' },
  { id: 'products', name: 'Try Products', icon: '🍽️', desc: 'Order specific items' },
  { id: 'categories', name: 'Explore Categories', icon: '🗂️', desc: 'Order from categories' },
  { id: 'streak', name: 'Daily Streak', icon: '🔥', desc: 'Order consecutive days' },
  { id: 'referral', name: 'Referral Goal', icon: '🤝', desc: 'Refer X friends' },
  { id: 'custom', name: 'Custom', icon: '⚡', desc: 'Custom challenge' },
];

const REWARD_TYPES = [
  { id: 'points', name: 'Bonus Points', icon: '⭐' },
  { id: 'voucher', name: 'Voucher Code', icon: '🎟️' },
  { id: 'free_item', name: 'Free Item', icon: '🎁' },
  { id: 'tier_upgrade', name: 'Tier Upgrade', icon: '⬆️' },
];

interface ChallengesPageProps {
  challenges: LoyaltyChallenge[];
  segments: CustomerSegment[];
}

export const AdminChallengesPage: FC<ChallengesPageProps> = ({ challenges, segments }) => {
  const activeChallenges = challenges.filter(c => c.is_active);
  const totalParticipants = challenges.reduce((sum, c) => sum + (c.participants_count || 0), 0);
  const totalCompletions = challenges.reduce((sum, c) => sum + (c.completions_count || 0), 0);

  return (
    <AdminLayout title="Challenges" currentPath="/admin/loyalty/challenges">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Loyalty Challenges</h1>
          <p class="text-muted" style="margin-top: 4px;">Create engaging challenges to boost customer loyalty</p>
        </div>
        <button onclick="openChallengeModal()" class="btn btn-primary">+ Create Challenge</button>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Challenges</div>
          <div class="stat-value">{challenges.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value" style="color: var(--success);">{activeChallenges.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Participants</div>
          <div class="stat-value" style="color: var(--primary);">{totalParticipants.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Completions</div>
          <div class="stat-value" style="color: #FF9800;">{totalCompletions.toLocaleString()}</div>
        </div>
      </div>

      {/* Challenges Grid */}
      {challenges.length > 0 ? (
        <div class="challenges-grid">
          {challenges.map(challenge => {
            const type = CHALLENGE_TYPES.find(t => t.id === challenge.challenge_type) || CHALLENGE_TYPES[0];
            const reward = REWARD_TYPES.find(r => r.id === challenge.reward_type) || REWARD_TYPES[0];
            const segment = segments.find(s => s.id === challenge.segment_id);
            const completionRate = challenge.participants_count > 0
              ? Math.round((challenge.completions_count / challenge.participants_count) * 100)
              : 0;

            return (
              <div class={`challenge-card ${!challenge.is_active ? 'inactive' : ''}`}>
                {challenge.image_url && (
                  <div class="challenge-image" style={`background-image: url('${challenge.image_url}')`}></div>
                )}
                <div class="challenge-content">
                  <div class="challenge-header">
                    <span class="challenge-type">
                      <span class="type-icon">{type.icon}</span>
                      {type.name}
                    </span>
                    <span class={`status-badge ${challenge.is_active ? 'active' : ''}`}>
                      {challenge.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 class="challenge-name">{escapeHtml(challenge.name)}</h3>
                  {challenge.description && (
                    <p class="challenge-description">{escapeHtml(challenge.description)}</p>
                  )}

                  <div class="challenge-goal">
                    <div class="goal-label">Goal</div>
                    <div class="goal-value">
                      {type.id === 'spend' && `Spend $${challenge.target_value}`}
                      {type.id === 'visits' && `Visit ${challenge.target_value} times`}
                      {type.id === 'products' && `Try ${challenge.target_value} products`}
                      {type.id === 'categories' && `Order from ${challenge.target_value} categories`}
                      {type.id === 'streak' && `${challenge.target_value} day streak`}
                      {type.id === 'referral' && `Refer ${challenge.target_value} friends`}
                      {type.id === 'custom' && `Complete ${challenge.target_value} actions`}
                    </div>
                  </div>

                  <div class="challenge-reward">
                    <span class="reward-icon">{reward.icon}</span>
                    <span class="reward-text">
                      {challenge.reward_type === 'points' && `${challenge.reward_value} bonus points`}
                      {challenge.reward_type === 'voucher' && `Voucher: ${challenge.reward_value}`}
                      {challenge.reward_type === 'free_item' && `Free: ${challenge.reward_value}`}
                      {challenge.reward_type === 'tier_upgrade' && 'Tier Upgrade'}
                    </span>
                  </div>

                  <div class="challenge-stats">
                    <div class="stat-item">
                      <span class="stat-number">{challenge.participants_count}</span>
                      <span class="stat-name">Participants</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{challenge.completions_count}</span>
                      <span class="stat-name">Completions</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{completionRate}%</span>
                      <span class="stat-name">Completion Rate</span>
                    </div>
                  </div>

                  {(challenge.duration_days || segment || challenge.start_date) && (
                    <div class="challenge-meta">
                      {challenge.duration_days && (
                        <span class="meta-item">⏱️ {challenge.duration_days} days</span>
                      )}
                      {segment && (
                        <span class="meta-item">🎯 {escapeHtml(segment.name)}</span>
                      )}
                      {challenge.start_date && (
                        <span class="meta-item">📅 {formatDate(challenge.start_date)}</span>
                      )}
                    </div>
                  )}

                  <div class="challenge-actions">
                    <button onclick={`editChallenge(${challenge.id})`} class="btn btn-ghost btn-sm">Edit</button>
                    <button onclick={`viewProgress(${challenge.id})`} class="btn btn-ghost btn-sm">Progress</button>
                    <button onclick={`deleteChallenge(${challenge.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">🏆</div>
          <h3 class="empty-state-title">No Challenges</h3>
          <p class="empty-state-text">Create challenges to engage customers and reward their loyalty.</p>
          <button onclick="openChallengeModal()" class="btn btn-primary">+ Create Challenge</button>
        </div>
      )}

      {/* Challenge Modal */}
      <div id="challenge-modal" class="challenge-modal">
        <div class="challenge-modal-backdrop" onclick="closeChallengeModal()"></div>
        <div class="challenge-modal-content">
          <div class="modal-header">
            <h2 id="modal-title">Create Challenge</h2>
            <button onclick="closeChallengeModal()" class="modal-close">&times;</button>
          </div>

          <form id="challenge-form" onsubmit="saveChallenge(event)">
            <input type="hidden" id="challenge-id" value="" />

            <div class="form-group">
              <label class="form-label">Challenge Name *</label>
              <input type="text" id="challenge-name" class="form-input" required placeholder="e.g., Weekend Warrior" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="challenge-description" class="form-textarea" rows={2} placeholder="Describe the challenge"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Image URL (Optional)</label>
              <input type="text" id="challenge-image" class="form-input" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label class="form-label">Challenge Type *</label>
              <div class="type-options">
                {CHALLENGE_TYPES.map(type => (
                  <label class="type-option">
                    <input type="radio" name="challenge_type" value={type.id} />
                    <div class="type-content">
                      <span class="type-icon">{type.icon}</span>
                      <span class="type-name">{type.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label" id="target-label">Target Value *</label>
                <input type="number" id="challenge-target" class="form-input" required min="1" value="5" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Duration (Days)</label>
                <input type="number" id="challenge-duration" class="form-input" min="1" placeholder="No limit" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Reward Type *</label>
              <div class="reward-options">
                {REWARD_TYPES.map(reward => (
                  <label class="reward-option">
                    <input type="radio" name="reward_type" value={reward.id} />
                    <div class="reward-content">
                      <span class="reward-icon">{reward.icon}</span>
                      <span class="reward-name">{reward.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" id="reward-label">Reward Value *</label>
              <input type="text" id="challenge-reward-value" class="form-input" required placeholder="e.g., 500 for points, or item name" />
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Restrict to Segment</label>
                <select id="challenge-segment" class="form-select">
                  <option value="">All Customers</option>
                  {segments.map(seg => (
                    <option value={seg.id}>{escapeHtml(seg.name)}</option>
                  ))}
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Max Completions per Customer</label>
                <input type="number" id="challenge-max-completions" class="form-input" min="1" value="1" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Start Date (Optional)</label>
                <input type="date" id="challenge-start-date" class="form-input" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">End Date (Optional)</label>
                <input type="date" id="challenge-end-date" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2">
                <input type="checkbox" id="challenge-active" checked />
                <span>Active</span>
              </label>
            </div>

            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Save Challenge</button>
              <button type="button" onclick="closeChallengeModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .challenge-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        .challenge-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .challenge-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .challenge-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .challenge-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .challenge-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .challenge-modal-content .modal-close:hover {
          color: var(--text);
        }
        .challenge-modal-content form {
          padding: 24px;
        }
        .challenge-modal-content .form-group {
          margin-bottom: 16px;
        }
        .challenge-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .challenge-modal-content .form-input,
        .challenge-modal-content .form-select,
        .challenge-modal-content .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }

        .challenges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        .challenge-card {
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: all 0.2s;
        }
        .challenge-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .challenge-card.inactive {
          opacity: 0.6;
        }
        .challenge-image {
          height: 140px;
          background-size: cover;
          background-position: center;
          background-color: var(--bg-alt);
        }
        .challenge-content {
          padding: 20px;
        }
        .challenge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .challenge-type {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-alt);
          padding: 4px 10px;
          border-radius: 12px;
        }
        .type-icon {
          font-size: 14px;
        }
        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--text-muted);
          color: white;
        }
        .status-badge.active {
          background: var(--success);
        }
        .challenge-name {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 6px;
        }
        .challenge-description {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0 0 16px;
          line-height: 1.5;
        }

        .challenge-goal {
          background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 12px;
        }
        .goal-label {
          font-size: 11px;
          font-weight: 600;
          color: #1976D2;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .goal-value {
          font-size: 16px;
          font-weight: 700;
          color: #0D47A1;
        }

        .challenge-reward {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .challenge-reward .reward-icon {
          font-size: 20px;
        }
        .reward-text {
          font-size: 14px;
          font-weight: 600;
          color: #E65100;
        }

        .challenge-stats {
          display: flex;
          gap: 20px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .stat-item {
          text-align: center;
          flex: 1;
        }
        .stat-number {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }
        .stat-name {
          font-size: 11px;
          color: var(--text-muted);
        }

        .challenge-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 12px;
        }
        .meta-item {
          font-size: 12px;
          color: var(--text-muted);
        }

        .challenge-actions {
          display: flex;
          gap: 8px;
        }

        /* Modal styles */
        .type-options, .reward-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .type-option, .reward-option {
          cursor: pointer;
        }
        .type-option input, .reward-option input {
          display: none;
        }
        .type-content, .reward-content {
          border: 2px solid var(--border);
          border-radius: 10px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .type-option input:checked + .type-content,
        .reward-option input:checked + .reward-content {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .type-content .type-icon, .reward-content .reward-icon {
          font-size: 18px;
        }
        .type-name, .reward-name {
          font-size: 13px;
          font-weight: 600;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          margin-bottom: 16px;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const challengesData = ${JSON.stringify(challenges)};

        function openChallengeModal() {
          document.getElementById('modal-title').textContent = 'Create Challenge';
          document.getElementById('challenge-id').value = '';
          document.getElementById('challenge-name').value = '';
          document.getElementById('challenge-description').value = '';
          document.getElementById('challenge-image').value = '';
          document.querySelector('input[name="challenge_type"][value="spend"]').checked = true;
          document.getElementById('challenge-target').value = '5';
          document.getElementById('challenge-duration').value = '';
          document.querySelector('input[name="reward_type"][value="points"]').checked = true;
          document.getElementById('challenge-reward-value').value = '';
          document.getElementById('challenge-segment').value = '';
          document.getElementById('challenge-max-completions').value = '1';
          document.getElementById('challenge-start-date').value = '';
          document.getElementById('challenge-end-date').value = '';
          document.getElementById('challenge-active').checked = true;
          const modal = document.getElementById('challenge-modal');
          modal.style.display = 'flex';
        }

        function editChallenge(id) {
          const challenge = challengesData.find(c => c.id === id);
          if (!challenge) return;

          document.getElementById('modal-title').textContent = 'Edit Challenge';
          document.getElementById('challenge-id').value = challenge.id;
          document.getElementById('challenge-name').value = challenge.name;
          document.getElementById('challenge-description').value = challenge.description || '';
          document.getElementById('challenge-image').value = challenge.image_url || '';
          document.querySelector('input[name="challenge_type"][value="' + challenge.challenge_type + '"]').checked = true;
          document.getElementById('challenge-target').value = challenge.target_value;
          document.getElementById('challenge-duration').value = challenge.duration_days || '';
          document.querySelector('input[name="reward_type"][value="' + challenge.reward_type + '"]').checked = true;
          document.getElementById('challenge-reward-value').value = challenge.reward_value;
          document.getElementById('challenge-segment').value = challenge.segment_id || '';
          document.getElementById('challenge-max-completions').value = challenge.max_completions || '1';
          document.getElementById('challenge-start-date').value = challenge.start_date ? challenge.start_date.split('T')[0] : '';
          document.getElementById('challenge-end-date').value = challenge.end_date ? challenge.end_date.split('T')[0] : '';
          document.getElementById('challenge-active').checked = challenge.is_active === 1;
          const modal = document.getElementById('challenge-modal');
          modal.style.display = 'flex';
        }

        function closeChallengeModal() {
          document.getElementById('challenge-modal').style.display = 'none';
        }

        function viewProgress(id) {
          // TODO: Open progress modal showing customer progress
          alert('Progress view coming soon');
        }

        async function saveChallenge(e) {
          e.preventDefault();

          const id = document.getElementById('challenge-id').value;
          const challengeType = document.querySelector('input[name="challenge_type"]:checked')?.value;
          const rewardType = document.querySelector('input[name="reward_type"]:checked')?.value;

          const data = {
            name: document.getElementById('challenge-name').value,
            description: document.getElementById('challenge-description').value,
            image_url: document.getElementById('challenge-image').value || null,
            challenge_type: challengeType,
            target_value: parseInt(document.getElementById('challenge-target').value),
            target_config: '{}',
            reward_type: rewardType,
            reward_value: document.getElementById('challenge-reward-value').value,
            duration_days: document.getElementById('challenge-duration').value ? parseInt(document.getElementById('challenge-duration').value) : null,
            max_completions: parseInt(document.getElementById('challenge-max-completions').value) || 1,
            segment_id: document.getElementById('challenge-segment').value || null,
            start_date: document.getElementById('challenge-start-date').value || null,
            end_date: document.getElementById('challenge-end-date').value || null,
            is_active: document.getElementById('challenge-active').checked ? 1 : 0
          };

          try {
            const url = id ? '/api/challenges/' + id : '/api/challenges';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to save challenge');
            }
          } catch (err) {
            alert('Error saving challenge');
          }
        }

        async function deleteChallenge(id) {
          if (!confirm('Delete this challenge? This will also remove all customer progress.')) return;
          try {
            const res = await fetch('/api/challenges/' + id, { method: 'DELETE' });
            if (res.ok) location.reload();
            else alert('Failed to delete');
          } catch (err) {
            alert('Error deleting');
          }
        }
      `}} />
    </AdminLayout>
  );
};
