import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ContainerType, ServiceCategory } from '../../core/models';

@Component({
  selector: 'eg-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-hero compact">
      <p class="eyebrow">Services</p>
      <h1>Ocean freight, container solutions, and Middle East inland support.</h1>
    </section>

    <section class="section">
      <div class="service-grid">
        @for (service of services; track service.slug) {
          <article>
            <h2>{{ service.name }}</h2>
            <p>{{ service.description }}</p>
          </article>
        }
      </div>
    </section>

    <section class="section muted">
      <div class="section-title">
        <p class="eyebrow">Our Containers</p>
        <h2>Equipment options for general, refrigerated, oversized, and special cargo.</h2>
      </div>
      <div class="container-grid">
        @for (container of containers; track container.id) {
          <article>
            <h3>{{ container.name }}</h3>
            <p>{{ container.description }}</p>
            <strong>{{ container.capacityInfo }}</strong>
          </article>
        }
      </div>
    </section>

    <section class="section split">
      <div>
        <p class="eyebrow">Our Global Inland Services in the Middle East</p>
        <h2>Port-to-door coordination for regional freight movement.</h2>
      </div>
      <p>Elite Group supports inland transportation from major ports to customer facilities, combining truck planning, customs/logistics coordination, and shipment status updates for operational teams.</p>
    </section>
  `
})
export class ServicesComponent implements OnInit {
  services: ServiceCategory[] = [
    { id: 'reefer', name: 'Reefer Cargo', slug: 'reefer-cargo', description: 'Cold chain support for chilled and frozen cargo with equipment coordination.' },
    { id: 'special', name: 'Special Cargo', slug: 'special-cargo', description: 'Project cargo and non-standard equipment planning for complex shipments.' },
    { id: 'dg', name: 'Dangerous Goods', slug: 'dangerous-goods', description: 'Documentation-led support for compliant hazardous cargo movement.' },
    { id: 'ocean', name: 'Ocean Freight', slug: 'ocean-freight', description: 'FCL and LCL ocean freight schedules and monthly rate visibility.' },
    { id: 'inland', name: 'Inland Transportation', slug: 'inland-transportation', description: 'Truck and intermodal coordination across key Middle East lanes.' },
    { id: 'customs', name: 'Customs / Logistics Support', slug: 'customs-logistics-support', description: 'Documentation, clearance coordination, and operational shipment support.' }
  ];
  containers: ContainerType[] = [];

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.api.categories().subscribe((services) => {
      if (services.length) {
        this.services = services;
      }
    });
    this.api.containers().subscribe((containers) => {
      if (containers.length) {
        this.containers = containers;
      }
    });
  }
}
