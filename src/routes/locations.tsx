import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { Branch } from '../types';
import { escapeHtml, isOpen } from '../utils/helpers';

interface LocationsPageProps {
  branches: Branch[];
}

export const LocationsPage: FC<LocationsPageProps> = ({ branches }) => {
  return (
    <Layout title="Locations">
      <Header currentPath="/locations" />

      <div class="container" style="padding: 40px 20px;">
        <h1 class="section-title">Our Locations</h1>
        <p class="section-subtitle">Find a restaurant near you</p>

        {branches.length > 0 ? (
          <div class="grid grid-2" style="gap: 24px;">
            {branches.map(branch => {
              const open = isOpen(branch.opening_hours, branch.closing_hours);
              const features = branch.features ? branch.features.split(',') : [];

              return (
                <div class="card" style="overflow: hidden;">
                  {branch.image_url && (
                    <img
                      src={branch.image_url}
                      alt={escapeHtml(branch.name)}
                      style="width: 100%; height: 200px; object-fit: cover;"
                    />
                  )}
                  <div class="card-body">
                    <div class="flex items-center justify-between mb-2">
                      <h3 class="card-title" style="margin: 0;">{escapeHtml(branch.name)}</h3>
                      <span class={`badge ${open ? 'badge-new' : 'badge-popular'}`} style={open ? '' : 'background: var(--text-muted);'}>
                        {open ? 'Open Now' : 'Closed'}
                      </span>
                    </div>

                    <div style="margin: 16px 0;">
                      <div class="flex gap-1 mb-1">
                        <span>📍</span>
                        <span>{escapeHtml(branch.address)}</span>
                      </div>
                      <div class="flex gap-1 mb-1">
                        <span>📞</span>
                        <a href={`tel:${branch.phone}`}>{escapeHtml(branch.phone)}</a>
                      </div>
                      <div class="flex gap-1 mb-1">
                        <span>🕐</span>
                        <span>{branch.opening_hours} - {branch.closing_hours}</span>
                      </div>
                      {branch.email && (
                        <div class="flex gap-1">
                          <span>✉️</span>
                          <a href={`mailto:${branch.email}`}>{escapeHtml(branch.email)}</a>
                        </div>
                      )}
                    </div>

                    {features.length > 0 && (
                      <div class="flex gap-1 flex-wrap mb-3">
                        {features.map(f => (
                          <span class="badge" style="background: var(--bg-alt); color: var(--text);">
                            {f.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div class="flex gap-2">
                      <a href={`/menu?branch=${branch.id}`} class="btn btn-primary" style="flex: 1;">
                        Order Here
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(branch.address)}`}
                        target="_blank"
                        class="btn btn-secondary"
                      >
                        Directions
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div class="empty-state">
            <div class="empty-state-icon">🏪</div>
            <h3 class="empty-state-title">No Locations Yet</h3>
            <p class="empty-state-text">We're coming soon to a location near you!</p>
          </div>
        )}
      </div>

      <Footer />
    </Layout>
  );
};
