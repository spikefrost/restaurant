import type { FC } from 'hono/jsx';
import type { OrderWithDetails, OrderItem, Branch } from '../types';
import { escapeHtml } from '../utils/helpers';

interface KitchenPageProps {
  orders: OrderWithDetails[];
  orderItems: Record<number, OrderItem[]>;
  branches: Branch[];
  currentBranch?: number;
}

export const KitchenDisplayPage: FC<KitchenPageProps> = ({ orders, orderItems, branches, currentBranch }) => {
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  // Prepare full order data for modal
  const ordersWithItems = orders.map(order => ({
    ...order,
    items: orderItems[order.id] || []
  }));

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Kitchen Display</title>
        <meta http-equiv="refresh" content="30" />
        <style>{`
          :root {
            --primary: #E85D04;
            --success: #10B981;
            --warning: #F59E0B;
            --error: #EF4444;
            --info: #3B82F6;
            --bg: #1a1a2e;
            --bg-card: #16213e;
            --text: #eee;
            --text-muted: #888;
            --border: #333;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
          }
          .header {
            background: var(--bg-card);
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
          }
          .header h1 {
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .header h1 span { font-size: 28px; }
          .time {
            font-size: 32px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
          }
          .branch-select {
            padding: 8px 16px;
            font-size: 16px;
            background: var(--bg);
            color: var(--text);
            border: 1px solid var(--border);
            border-radius: 8px;
          }
          .columns {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            padding: 16px;
            height: calc(100vh - 80px);
          }
          .column {
            background: var(--bg-card);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .column-header {
            padding: 16px 20px;
            font-size: 18px;
            font-weight: 700;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .column-header .count {
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
          }
          .column.pending .column-header { background: var(--warning); color: #000; }
          .column.preparing .column-header { background: var(--primary); }
          .column.ready .column-header { background: var(--success); }
          .column-body {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
          }
          .order-card {
            background: var(--bg);
            border-radius: 8px;
            margin-bottom: 12px;
            overflow: hidden;
            border: 1px solid var(--border);
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .order-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          }
          .order-header {
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
          }
          .order-number {
            font-size: 20px;
            font-weight: 700;
          }
          .order-type {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .order-type.dine_in { background: #3B82F6; }
          .order-type.takeaway { background: #8B5CF6; }
          .order-meta {
            padding: 8px 16px;
            background: rgba(255,255,255,0.05);
            font-size: 13px;
            color: var(--text-muted);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .order-items-preview {
            padding: 12px 16px;
          }
          .order-item-preview {
            display: flex;
            gap: 8px;
            padding: 4px 0;
            font-size: 14px;
          }
          .item-qty-badge {
            background: var(--primary);
            color: white;
            min-width: 24px;
            height: 24px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
          }
          .order-notes-indicator {
            padding: 8px 16px;
            background: rgba(245, 158, 11, 0.2);
            color: var(--warning);
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .order-actions {
            padding: 12px 16px;
            display: flex;
            gap: 8px;
          }
          .btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .btn:hover { opacity: 0.9; }
          .btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .btn-primary { background: var(--primary); color: white; }
          .btn-success { background: var(--success); color: white; }
          .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); }
          .timer {
            font-size: 18px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
          }
          .timer.warning { color: var(--warning); }
          .timer.danger { color: var(--error); animation: blink 1s infinite; }
          @keyframes blink {
            50% { opacity: 0.5; }
          }
          .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--text-muted);
          }
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
            z-index: 1000;
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .sound-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            cursor: pointer;
          }
          .sound-indicator.muted { color: var(--text-muted); }

          /* Order Detail Modal */
          .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            align-items: center;
            justify-content: center;
          }
          .modal-overlay.active {
            display: flex;
          }
          .modal-content {
            background: var(--bg-card);
            border-radius: 16px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
          }
          .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background: var(--bg-card);
            z-index: 10;
          }
          .modal-header h2 {
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .modal-close {
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 32px;
            cursor: pointer;
            line-height: 1;
          }
          .modal-close:hover {
            color: var(--text);
          }
          .modal-body {
            padding: 24px;
          }
          .detail-section {
            margin-bottom: 24px;
          }
          .detail-section-title {
            font-size: 12px;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 12px;
            font-weight: 600;
          }
          .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .detail-item {
            background: var(--bg);
            padding: 12px 16px;
            border-radius: 8px;
          }
          .detail-item-label {
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .detail-item-value {
            font-size: 16px;
            font-weight: 600;
          }
          .order-item-detail {
            background: var(--bg);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
          }
          .order-item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }
          .order-item-name {
            font-size: 18px;
            font-weight: 600;
          }
          .order-item-qty {
            background: var(--primary);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 700;
          }
          .order-item-price {
            color: var(--text-muted);
            font-size: 14px;
          }
          .order-item-mods {
            margin-top: 8px;
            padding: 8px 12px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 6px;
            font-size: 14px;
            color: var(--info);
          }
          .order-item-notes {
            margin-top: 8px;
            padding: 8px 12px;
            background: rgba(245, 158, 11, 0.2);
            border-radius: 6px;
            font-size: 14px;
            color: var(--warning);
          }
          .order-special-notes {
            background: rgba(245, 158, 11, 0.15);
            border: 1px solid var(--warning);
            border-radius: 8px;
            padding: 16px;
            color: var(--warning);
          }
          .order-special-notes-title {
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .modal-footer {
            padding: 20px 24px;
            border-top: 1px solid var(--border);
            display: flex;
            gap: 12px;
            position: sticky;
            bottom: 0;
            background: var(--bg-card);
          }
          .modal-footer .btn {
            padding: 16px;
            font-size: 16px;
          }
          .prep-timer-large {
            text-align: center;
            padding: 16px;
            background: var(--bg);
            border-radius: 8px;
            margin-bottom: 16px;
          }
          .prep-timer-large .label {
            font-size: 12px;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 4px;
          }
          .prep-timer-large .time {
            font-size: 48px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
          }
        `}</style>
      </head>
      <body>
        <header class="header">
          <h1><span>👨‍🍳</span> Kitchen Display</h1>
          <select class="branch-select" onchange="changeBranch(this.value)">
            <option value="">All Branches</option>
            {branches.map(b => (
              <option value={b.id} selected={currentBranch === b.id}>{b.name}</option>
            ))}
          </select>
          <div class="sound-indicator" id="sound-indicator">
            <span>🔔</span> Sound: ON
          </div>
          <div class="time" id="clock">00:00:00</div>
        </header>

        <div class="columns">
          {/* Pending Orders */}
          <div class="column pending">
            <div class="column-header">
              <span>🆕 New Orders</span>
              <span class="count">{pendingOrders.length}</span>
            </div>
            <div class="column-body">
              {pendingOrders.length === 0 ? (
                <div class="empty-state">No pending orders</div>
              ) : (
                pendingOrders.map(order => {
                  const items = orderItems[order.id] || [];
                  const hasNotes = order.special_instructions || items.some(i => i.special_instructions);
                  return (
                    <div class="order-card" data-order-id={order.id} data-created={order.created_at} onclick={`openOrderModal(${order.id})`}>
                      <div class="order-header">
                        <span class="order-number">{order.order_number}</span>
                        <span class={`order-type ${order.order_type}`}>
                          {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                        </span>
                      </div>
                      <div class="order-meta">
                        <span>
                          {order.table_number && `Table ${order.table_number} · `}
                          {order.branch_name || 'Main Branch'}
                        </span>
                        <span class="timer" data-start={order.created_at}>00:00</span>
                      </div>
                      <div class="order-items-preview">
                        {items.slice(0, 3).map(item => (
                          <div class="order-item-preview">
                            <span class="item-qty-badge">{item.quantity}</span>
                            <span>{escapeHtml(item.item_name)}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div class="order-item-preview" style="color: var(--text-muted);">
                            + {items.length - 3} more items
                          </div>
                        )}
                      </div>
                      {hasNotes && (
                        <div class="order-notes-indicator">
                          📝 Has special instructions
                        </div>
                      )}
                      <div class="order-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-primary" onclick={`updateStatus(${order.id}, 'preparing')`}>
                          Start Preparing
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Preparing Orders */}
          <div class="column preparing">
            <div class="column-header">
              <span>🍳 Preparing</span>
              <span class="count">{preparingOrders.length}</span>
            </div>
            <div class="column-body">
              {preparingOrders.length === 0 ? (
                <div class="empty-state">No orders in progress</div>
              ) : (
                preparingOrders.map(order => {
                  const items = orderItems[order.id] || [];
                  const hasNotes = order.special_instructions || items.some(i => i.special_instructions);
                  return (
                    <div class="order-card" data-order-id={order.id} data-created={order.started_at || order.created_at} onclick={`openOrderModal(${order.id})`}>
                      <div class="order-header">
                        <span class="order-number">{order.order_number}</span>
                        <span class={`order-type ${order.order_type}`}>
                          {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                        </span>
                      </div>
                      <div class="order-meta">
                        <span>
                          {order.table_number && `Table ${order.table_number}`}
                        </span>
                        <span class="timer" data-start={order.started_at || order.created_at}>00:00</span>
                      </div>
                      <div class="order-items-preview">
                        {items.slice(0, 3).map(item => (
                          <div class="order-item-preview">
                            <span class="item-qty-badge">{item.quantity}</span>
                            <span>{escapeHtml(item.item_name)}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div class="order-item-preview" style="color: var(--text-muted);">
                            + {items.length - 3} more items
                          </div>
                        )}
                      </div>
                      {hasNotes && (
                        <div class="order-notes-indicator">
                          📝 Has special instructions
                        </div>
                      )}
                      <div class="order-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-ghost" onclick={`updateStatus(${order.id}, 'pending')`}>
                          Back
                        </button>
                        <button class="btn btn-success" onclick={`updateStatus(${order.id}, 'ready')`}>
                          Mark Ready
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Ready Orders */}
          <div class="column ready">
            <div class="column-header">
              <span>✅ Ready</span>
              <span class="count">{readyOrders.length}</span>
            </div>
            <div class="column-body">
              {readyOrders.length === 0 ? (
                <div class="empty-state">No orders ready</div>
              ) : (
                readyOrders.map(order => (
                  <div class="order-card" data-order-id={order.id} onclick={`openOrderModal(${order.id})`}>
                    <div class="order-header">
                      <span class="order-number">{order.order_number}</span>
                      <span class={`order-type ${order.order_type}`}>
                        {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                      </span>
                    </div>
                    <div class="order-meta">
                      <span>
                        {order.table_number && `Table ${order.table_number}`}
                        {order.customer_name && !order.table_number && escapeHtml(order.customer_name)}
                      </span>
                      {order.prep_time_seconds && (
                        <span style="color: var(--success);">
                          ⏱️ {Math.floor(order.prep_time_seconds / 60)}:{String(order.prep_time_seconds % 60).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <div class="order-actions" onclick="event.stopPropagation()">
                      <button class="btn btn-ghost" onclick={`updateStatus(${order.id}, 'preparing')`}>
                        Back to Kitchen
                      </button>
                      <button class="btn btn-success" onclick={`updateStatus(${order.id}, 'served')`}>
                        {order.order_type === 'dine_in' ? 'Served' : 'Picked Up'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Order Detail Modal */}
        <div id="order-modal" class="modal-overlay" onclick="closeOrderModal(event)">
          <div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h2><span id="modal-order-number"></span></h2>
              <button class="modal-close" onclick="closeOrderModal()">&times;</button>
            </div>
            <div class="modal-body">
              <div class="prep-timer-large" id="modal-timer-section">
                <div class="label">Prep Time</div>
                <div class="time timer" id="modal-timer" data-start="">00:00</div>
              </div>

              <div class="detail-section">
                <div class="detail-section-title">Order Details</div>
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-item-label">Type</div>
                    <div class="detail-item-value" id="modal-type"></div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-item-label">Table</div>
                    <div class="detail-item-value" id="modal-table"></div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-item-label">Customer</div>
                    <div class="detail-item-value" id="modal-customer"></div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-item-label">Total</div>
                    <div class="detail-item-value" id="modal-total"></div>
                  </div>
                </div>
              </div>

              <div class="detail-section" id="modal-notes-section" style="display: none;">
                <div class="order-special-notes">
                  <div class="order-special-notes-title">📝 Order Notes</div>
                  <div id="modal-notes"></div>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-section-title">Items (<span id="modal-item-count">0</span>)</div>
                <div id="modal-items"></div>
              </div>
            </div>
            <div class="modal-footer" id="modal-actions"></div>
          </div>
        </div>

        <div id="notification" class="notification" style="display: none;"></div>

        <audio id="alert-sound" preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2DgYF/gH6BgoOFhoWEgoKCgYKDgoKBgICAf4B/gH+AgICBgYGBgYKCgoKBgYGBgYGBgYB/f39/f39/f4CAgIGBgYGBgYGAgICAf39/f39/f4CAgIGBgYKCgoKCgYGBgYB/fn5+fn5/gIGCg4ODg4OCgYGAf35+fn5+f4CBgoOEhISDgoGAf35+fX1+f4CCg4WFhYSDgYB/fn19fX1+gIKEhoaGhYOBf359fX19fn+Bg4WGhoWDgYB+fX19fX5/gYOFhoeGhIKAf319fX1+f4GDhoeHhoSCf359fHx9fn+Bg4aIiIeEgn9+fHt7fH1/gYSHiYmHhIF+fHt7e3x+gIOGiYqJhoJ/fXt6ent9f4KFiIqKiIWBfnt6enp7fX+ChYmLi4mFgX57eXl5e31/goaJjIyJhYF+e3l5eXt9gIOGio2NioWBfnt5eHl7fYCDhomMjYqGgn57eXh5e32Ag4aJjI2LhoJ+e3l4eHp8f4KFiIuMi4eDf3x5eHh5e36Bg4eKjIyJhYF9enh3eHp8f4KFiIuMi4eEgHx5d3d4enyAgoWIi4yKh4N/fHl3d3h6fH+ChYiLjIqHg397eXd3eHp9gIKFiIuLioeDf3t5d3Z4enx/goWIi4uKh4N/e3l3dnh6fH+ChYiLi4qHg397eXd2eHp9gIKFiIuLioeDf3t5d3Z4enyAgoWIi4uKh4N/e3l3d3l7fYCChYiLioiEgH16eHd4enx/goWHioqJhoN/fHp4d3l7fYCChYiKioiEgH16eHd4enx/goWHioqJhoJ/fHp4d3l7fYCChYeKiomGgn98enh3eXt9gIKFh4qKiYaCf3x6eHd5e32AgoWHioqJhoJ/fHp4d3l7fYCChYeKiomGgn98enh3eXt9gIKFh4qKiYaCf3x6eHd5e32AgoWHioqJhoJ/fHp4d3l7fYCChYeKiomGgn98enh3eXt9gIKFh4qJiYaCf3x6eHd5e32AgoWHiYmHhYF+e3p3d3h6fX+BhIeJiIaEgH98enh2dnh6fICChYeJiYeEgH16eHZ2eHp8gIKFh4mJh4SAfXp4dnZ4enyAgoWHiYmHhIB9enh2dnh6fICChYeJiYeEgH16eHZ2eHp8gIKFh4mJh4SAfXp4dnZ4enyAgoWHiYmHhIB9enh2dnh6fICChYeJiYeEgH16eHZ2eHp8gIKFh4mJh4SAfXp4dnZ4enyAgoWHiYmHhIB9enh2dnh6fICChYeJiYeEgH16eHZ2eHp8gIKFh4mJh4SAfXp4dnZ4enyAgoWHiYmHhIB9enh2dnh6fICBhIaIiIaDgH16d3V2eHp8f4GEhoeHhYKAfXp3dnZ4enx/gYSGh4eFgoB9eXd1dnh6fH+BhIaHh4WCgH16d3V2eHp8f4GEhoeHhYKAfXp3dXZ4enx/gYSGh4eFgoB9end1dnh6fH+BhIaHh4WCgH16d3V2eHp8f4GEhoeHhYKAfXp3dXZ4enx/gYSGh4eFgoB9end1dnh6fH+BhIaHh4WCgH16d3V2eHp8f4GEhoeHhYKAfXp3dXZ4enx/gYOFh4eFgoB9eXd1dnh6fH+Bg4WHhYOAfXp3dXV3eXt+gIKEhoaEgn99end1dXd5e36AgoSGhoSCf316d3V1d3l7foCChIaGhIJ/fXp3dXV3eXt+gIKEhoaEgn99end1dXd5e36AgoSGhoSCf316d3V1d3l7foCChIaGhIJ/fXp3dXV3eXt+gIKEhoaEgn99end1dXd5e36AgoSGhoSCf316d3V1d3l7foCChIaGhIJ/fXp3dXV3eXt+gIKEhoaEgn99end1dXd5e36AgoOFhYOBf316eHV1d3l7foCBg4WFg4F/fXp4dXV3eXt+gIGDhYWDgX99enh1dXd5e36AgYOFhYOBf316eHV1d3l7foCBg4WFg4F/fXp4dXV3eXt+gIGDhYWDgX99enh1dXd5e36AgYOFhYOBf316eHV1d3l7fn+Bg4OEg4B+fHl3dXV3eXt9f4GDg4SAf3x6eHV1d3l7fX+Bg4ODgH98enh1dXd5e31/gYODg4B/fHp4dXV3eXt9f4GDg4OAfnx6eHV1dnh5e31/gYKCgn9+fHp4dXV3eHp8fn+BgoKCf358enh1dXd4ent9f4GBgYF+fXt5d3V1d3h6e31/gYGBgX59e3l3dXV3eHp7fX+BgYGBfn17eXd1dXd4ent9f4GBgYF+fXt5d3V1d3h6e31/gYGBgX59e3l3dXV3eHp7fX+BgYGBfn17eXd1dXd4ent9f4GBgYF+fXt5d3V1d3h6e31/gYGBgX59e3l3dXV3eHp7fX+BgYGBfn17eXd1dXd4ent9f4GBgYF+fXt5d3V1d3h6e31/gICAgH59e3l3dXV3eHp7fX+AgICAfn17eXd1dXd4ent9f4CAgIB+fXt5d3V1d3h6e31/gICAgH59e3l3dXV3eHp7fX+AgICAfn17eXd1dXd4ent9f4CAgIB+fXt5d3V1d3h6e31/gICAgH59e3l3dXV3eHp7fX9/f39/fXx6eHZ1dXd4eXt9f39/f39/fXx6eHZ1dXd4eXt9f39/f39/fXx6eHZ1dXd4eXt9f39/f39/fXx6eHZ1dXd4eXt9f39/f38=" type="audio/wav" />
        </audio>

        <script dangerouslySetInnerHTML={{ __html: `
          const ordersData = ${JSON.stringify(ordersWithItems)};

          // Update clock
          function updateClock() {
            const now = new Date();
            document.getElementById('clock').textContent = now.toLocaleTimeString('en-US', { hour12: false });
          }
          setInterval(updateClock, 1000);
          updateClock();

          // Update timers
          function updateTimers() {
            document.querySelectorAll('.timer[data-start]').forEach(timer => {
              const startStr = timer.dataset.start;
              if (!startStr) return;
              const start = new Date(startStr);
              const now = new Date();
              const diff = Math.floor((now - start) / 1000);
              const mins = Math.floor(diff / 60);
              const secs = diff % 60;
              timer.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

              // Color coding
              timer.classList.remove('warning', 'danger');
              if (mins >= 15) {
                timer.classList.add('danger');
              } else if (mins >= 10) {
                timer.classList.add('warning');
              }
            });
          }
          setInterval(updateTimers, 1000);
          updateTimers();

          // Branch filter
          function changeBranch(branchId) {
            const url = new URL(window.location);
            if (branchId) {
              url.searchParams.set('branch', branchId);
            } else {
              url.searchParams.delete('branch');
            }
            window.location = url;
          }

          // Open order detail modal
          function openOrderModal(orderId) {
            const order = ordersData.find(o => o.id === orderId);
            if (!order) return;

            document.getElementById('modal-order-number').textContent = order.order_number;
            document.getElementById('modal-type').textContent = order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway';
            document.getElementById('modal-table').textContent = order.table_number || '-';
            document.getElementById('modal-customer').textContent = order.customer_name || 'Walk-in';
            document.getElementById('modal-total').textContent = '$' + order.total.toFixed(2);
            document.getElementById('modal-item-count').textContent = order.items.length;

            // Timer
            const timerSection = document.getElementById('modal-timer-section');
            const modalTimer = document.getElementById('modal-timer');
            if (order.status !== 'ready' && order.status !== 'served') {
              timerSection.style.display = 'block';
              modalTimer.dataset.start = order.started_at || order.created_at;
            } else {
              timerSection.style.display = 'none';
            }

            // Notes
            const notesSection = document.getElementById('modal-notes-section');
            if (order.special_instructions) {
              notesSection.style.display = 'block';
              document.getElementById('modal-notes').textContent = order.special_instructions;
            } else {
              notesSection.style.display = 'none';
            }

            // Items
            const itemsContainer = document.getElementById('modal-items');
            itemsContainer.innerHTML = order.items.map(item => \`
              <div class="order-item-detail">
                <div class="order-item-header">
                  <div>
                    <div class="order-item-name">\${escapeHtml(item.item_name)}</div>
                    <div class="order-item-price">$\${item.unit_price.toFixed(2)} each</div>
                  </div>
                  <span class="order-item-qty">x\${item.quantity}</span>
                </div>
                \${item.modifiers ? \`<div class="order-item-mods">🔧 \${escapeHtml(item.modifiers)}</div>\` : ''}
                \${item.special_instructions ? \`<div class="order-item-notes">📝 \${escapeHtml(item.special_instructions)}</div>\` : ''}
              </div>
            \`).join('');

            // Actions based on status
            const actionsContainer = document.getElementById('modal-actions');
            if (order.status === 'pending') {
              actionsContainer.innerHTML = \`
                <button class="btn btn-primary" onclick="updateStatus(\${order.id}, 'preparing'); closeOrderModal();">Start Preparing</button>
              \`;
            } else if (order.status === 'preparing') {
              actionsContainer.innerHTML = \`
                <button class="btn btn-ghost" onclick="updateStatus(\${order.id}, 'pending'); closeOrderModal();">Back to Queue</button>
                <button class="btn btn-success" onclick="updateStatus(\${order.id}, 'ready'); closeOrderModal();">Mark Ready</button>
              \`;
            } else if (order.status === 'ready') {
              actionsContainer.innerHTML = \`
                <button class="btn btn-ghost" onclick="updateStatus(\${order.id}, 'preparing'); closeOrderModal();">Back to Kitchen</button>
                <button class="btn btn-success" onclick="updateStatus(\${order.id}, 'served'); closeOrderModal();">\${order.order_type === 'dine_in' ? 'Served' : 'Picked Up'}</button>
              \`;
            }

            document.getElementById('order-modal').classList.add('active');
          }

          function closeOrderModal(event) {
            if (event && event.target !== event.currentTarget) return;
            document.getElementById('order-modal').classList.remove('active');
          }

          function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          }

          // Update order status
          async function updateStatus(orderId, status) {
            try {
              const res = await fetch('/api/orders/' + orderId + '/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
              });

              if (res.ok) {
                showNotification('Order updated!');
                setTimeout(() => location.reload(), 500);
              } else {
                alert('Failed to update order');
              }
            } catch (err) {
              alert('Failed to update order');
            }
          }

          // Notifications
          function showNotification(message) {
            const el = document.getElementById('notification');
            el.textContent = message;
            el.style.display = 'block';
            setTimeout(() => { el.style.display = 'none'; }, 3000);
          }

          // Sound alert for new orders
          let lastOrderCount = ${pendingOrders.length};
          let soundEnabled = true;

          document.getElementById('sound-indicator').addEventListener('click', function() {
            soundEnabled = !soundEnabled;
            this.innerHTML = soundEnabled
              ? '<span>🔔</span> Sound: ON'
              : '<span>🔕</span> Sound: OFF';
            this.classList.toggle('muted', !soundEnabled);
          });

          // Check for new orders periodically
          async function checkNewOrders() {
            try {
              const res = await fetch('/api/orders?status=pending');
              const orders = await res.json();

              if (orders.length > lastOrderCount && soundEnabled) {
                document.getElementById('alert-sound').play().catch(() => {});
                showNotification('🆕 New order received!');
              }
              lastOrderCount = orders.length;
            } catch (err) {
              // Ignore
            }
          }

          // Check every 10 seconds
          setInterval(checkNewOrders, 10000);

          // Keyboard shortcuts
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              closeOrderModal();
            }
          });
        `}} />
      </body>
    </html>
  );
};
