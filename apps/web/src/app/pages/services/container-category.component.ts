import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ContainerCatalogItem } from '../../core/models';
import { categoryBySlug, categoryItems, subgroupItems } from './container-catalog-ui';

@Component({
  selector: 'eg-container-category',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (notFound) {
      <section class="section not-found-panel">
        <h1>Container category not found.</h1>
        <p>The requested container category is not available.</p>
        <a routerLink="/services/containers" class="text-link">Back to containers</a>
      </section>
    } @else if (category) {
      <section class="section container-category-page">
        <nav class="breadcrumb"><a routerLink="/services/containers">Containers</a><span>{{ category.name }}</span></nav>
        <h1>{{ category.name }}</h1>
        <p>{{ category.description }}</p>

        @if (loading) {
          <p class="catalogue-status">Loading container information.</p>
        } @else if (error) {
          <p class="catalogue-status">{{ error }}</p>
        } @else {
          <div class="container-subgroup-grid">
            @for (subgroup of subgroups; track subgroup.name) {
              <article class="container-subgroup">
                <img class="container-subgroup-image" [src]="subgroup.imageAsset || category.image" [alt]="subgroup.name + ' containers'">
                <h2>{{ subgroup.name }}</h2>
                <div class="container-link-list">
                  @for (item of subgroup.items; track item.slug) {
                    <a [routerLink]="['/services/containers', category.slug, item.slug]">{{ item.name }}</a>
                  }
                </div>
              </article>
            }
          </div>
        }
      </section>
    }
  `
})
export class ContainerCategoryComponent implements OnInit, OnDestroy {
  category = categoryBySlug('');
  items: ContainerCatalogItem[] = [];
  subgroups: Array<{ name: string; items: ContainerCatalogItem[]; illustrationKey: string; imageAsset: string }> = [];
  loading = true;
  error = '';
  notFound = false;
  private subscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService
  ) {}

  ngOnInit() {
    this.subscription = this.route.paramMap.subscribe((params) => {
      const slug = params.get('category');
      this.category = categoryBySlug(slug);
      this.notFound = !this.category;
      this.error = '';

      if (!this.category) {
        this.loading = false;
        return;
      }

      this.loading = true;
      this.api.containerCatalog().subscribe({
        next: (items) => {
          this.items = categoryItems(items, this.category?.slug || '');
          this.subgroups = subgroupItems(this.items);
          this.loading = false;
        },
        error: () => {
          this.error = 'The container catalogue could not be loaded.';
          this.loading = false;
        }
      });
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
