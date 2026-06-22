import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ContainerCatalogItem, ContainerCatalogMetric } from '../../core/models';
import { categoryBySlug, categoryItems } from './container-catalog-ui';

type DetailTab = 'default' | 'inside' | 'door';

@Component({
  selector: 'eg-container-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (notFound) {
      <section class="section not-found-panel">
        <h1>Container not found.</h1>
        <p>The requested container type is not available.</p>
        <a routerLink="/services/containers" class="text-link">Back to containers</a>
      </section>
    } @else if (item) {
      <section class="container-detail-page">
        <nav class="container-detail-breadcrumb">
          <a routerLink="/services/containers">Containers</a>
          <span>{{ item.name }}</span>
        </nav>

        <div class="container-detail-tabs">
          <button type="button" [class.active]="activeTab === 'default'" (click)="activeTab = 'default'">Default</button>
          <button type="button" [class.active]="activeTab === 'inside'" (click)="activeTab = 'inside'">Inside Dimensions</button>
          <button type="button" [class.active]="activeTab === 'door'" (click)="activeTab = 'door'">Door Opening Dimensions</button>
        </div>

        <section class="section detail-visual-section">
          <img class="container-detail-image" [src]="item.imageAsset || 'assets/images/services/container-dry-cargo.png'" [alt]="item.name">
        </section>

        <section class="section detail-info-section">
          <h1>General Container Information</h1>
          <p>{{ item.notesJson.disclaimer }}</p>

          @if (activeTab === 'default') {
            <div class="detail-info-grid">
              <div class="detail-table-shell">
                <table class="detail-table compact">
                  <tbody>
                    @for (row of generalRows(item); track row.label) {
                      <tr><th>{{ row.label }}</th><td>{{ row.value }}</td></tr>
                    }
                  </tbody>
                </table>
              </div>

              <aside class="standards-list">
                <h2>Standards</h2>
                @for (standard of relatedItems; track standard.slug) {
                  <a [routerLink]="['/services/containers', standard.categorySlug, standard.slug]">{{ standard.name }}</a>
                }
              </aside>
            </div>
          }

          @if (activeTab === 'default' || activeTab === 'inside') {
            <h2>Inside Dimension</h2>
            <div class="detail-table-shell">
              <table class="detail-table">
                <thead><tr><th>Measure</th><th>Length</th><th>Width</th><th>Height</th></tr></thead>
                <tbody>
                  <tr><th>Millimeters</th><td>{{ metricValue(item.specsJson.dimensions, 'length') }}</td><td>{{ metricValue(item.specsJson.dimensions, 'width') }}</td><td>{{ metricValue(item.specsJson.dimensions, 'height') }}</td></tr>
                  <tr><th>Feet</th><td>{{ metricDetail(item.specsJson.dimensions, 'length') }}</td><td>{{ metricDetail(item.specsJson.dimensions, 'width') }}</td><td>{{ metricDetail(item.specsJson.dimensions, 'height') }}</td></tr>
                </tbody>
              </table>
            </div>
          }

          @if (activeTab === 'default' || activeTab === 'door') {
            <h2>Door Opening</h2>
            <div class="detail-table-shell">
              <table class="detail-table">
                <thead><tr><th>Measure</th><th>Width</th><th>Height</th></tr></thead>
                <tbody>
                  <tr><th>Millimeters</th><td>{{ metricValue(item.specsJson.doorOpenings || [], 'width') }}</td><td>{{ metricValue(item.specsJson.doorOpenings || [], 'height') }}</td></tr>
                  <tr><th>Feet</th><td>{{ metricDetail(item.specsJson.doorOpenings || [], 'width') }}</td><td>{{ metricDetail(item.specsJson.doorOpenings || [], 'height') }}</td></tr>
                </tbody>
              </table>
            </div>
          }

          @if (activeTab === 'default') {
            <h2>Weight</h2>
            <div class="detail-table-shell">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Measure</th>
                    @for (metric of item.specsJson.weights; track metric.label) {
                      <th>{{ metric.label }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Primary</th>
                    @for (metric of item.specsJson.weights; track metric.label) {
                      <td>{{ metric.value }}</td>
                    }
                  </tr>
                  <tr>
                    <th>Secondary</th>
                    @for (metric of item.specsJson.weights; track metric.label) {
                      <td>{{ metric.detail || '-' }}</td>
                    }
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="detail-notes">
              @for (note of item.notesJson.notes; track note) {
                <p>{{ note }}</p>
              }
            </div>
          }
        </section>
      </section>
    } @else {
      <section class="section not-found-panel">
        <h1>Loading container information.</h1>
      </section>
    }
  `
})
export class ContainerDetailComponent implements OnInit, OnDestroy {
  item?: ContainerCatalogItem;
  relatedItems: ContainerCatalogItem[] = [];
  activeTab: DetailTab = 'default';
  notFound = false;
  private subscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService
  ) {}

  ngOnInit() {
    this.subscription = this.route.paramMap.subscribe((params) => {
      const categorySlug = params.get('category');
      const slug = params.get('slug') || '';
      this.notFound = false;
      this.item = undefined;
      this.activeTab = 'default';

      this.api.containerCatalogItem(slug).subscribe({
        next: (item) => {
          if (item.categorySlug !== categorySlug || !categoryBySlug(categorySlug)) {
            this.notFound = true;
            return;
          }

          this.item = item;
          this.loadRelated(item.categorySlug);
        },
        error: () => {
          this.notFound = true;
        }
      });
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  generalRows(item: ContainerCatalogItem) {
    return [
      { label: 'Capacity', value: this.capacityText(item) },
      { label: 'ISO Type Group', value: this.isoTypeGroup(item) },
      { label: 'ISO Size Type', value: this.isoSizeType(item) }
    ];
  }

  metricValue(metrics: ContainerCatalogMetric[], key: string) {
    return metrics.find((metric) => metric.label.toLowerCase().includes(key))?.value || '-';
  }

  metricDetail(metrics: ContainerCatalogMetric[], key: string) {
    return metrics.find((metric) => metric.label.toLowerCase().includes(key))?.detail || '-';
  }

  private loadRelated(categorySlug: string) {
    this.api.containerCatalog().subscribe((items) => {
      this.relatedItems = categoryItems(items, categorySlug);
    });
  }

  private capacityText(item: ContainerCatalogItem) {
    const capacity = item.specsJson.capacity;
    if (!capacity) {
      return '-';
    }
    return capacity.detail ? `${capacity.value} / ${capacity.detail}` : capacity.value;
  }

  private isoTypeGroup(item: ContainerCatalogItem) {
    if (item.categorySlug === 'reefer-cargo') {
      return 'Refrigerated container';
    }
    if (item.illustrationKey === 'tank') {
      return 'Tank container';
    }
    if (item.categorySlug === 'special-cargo') {
      return 'Special cargo container';
    }
    return item.name.includes('Hardtop') ? 'Hardtop container' : 'General purpose container';
  }

  private isoSizeType(item: ContainerCatalogItem) {
    if (item.name.startsWith("45'")) {
      return '45 ft';
    }
    if (item.name.startsWith("40'")) {
      return item.name.includes('High Cube') ? '40 ft high cube' : '40 ft';
    }
    if (item.name.startsWith("20'")) {
      return '20 ft';
    }
    return item.name;
  }
}
