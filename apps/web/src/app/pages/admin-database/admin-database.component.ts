import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { DatabaseField, DatabaseRow, DatabaseTable } from '../../core/models';

interface LoadRowsOptions {
  resetSelection: boolean;
}

type DatabaseTab = 'schema' | 'rows' | 'editor' | 'data';

@Component({
  selector: 'eg-admin-database',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="admin-page database-page">
      @if (selectedTable; as table) {
        <nav class="admin-breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/admin/database">Database</a>
          <a routerLink="/admin/database">Tables</a>
          <span>{{ table.label }}</span>
        </nav>

        <header class="admin-page-header database-detail-header">
          <div>
            <h1>{{ table.key }}</h1>
            <p>{{ table.label }} rows, schema, and editable records.</p>
          </div>
          <div class="admin-toolbar">
            <button class="secondary-action export-action" type="button" (click)="exportRows()">
              <span class="download-mini-icon" aria-hidden="true"></span>
              <span>Export</span>
            </button>
            @if (table.create !== false) {
              <button class="primary-action add-row-action" type="button" (click)="startCreate()">
                <span class="lock-mini-icon" aria-hidden="true"></span>
                <span>Add Row</span>
              </button>
            }
            <button class="secondary-action refresh-action" type="button" (click)="reload()">
              <span class="refresh-mini-icon" aria-hidden="true"></span>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <article class="database-detail-shell">
          <div class="database-tabs" role="tablist" aria-label="Database table views">
            <button type="button" [class.active]="activeTab === 'schema'" (click)="setTab('schema')">Schema</button>
            <button type="button" [class.active]="activeTab === 'rows'" (click)="setTab('rows')">Rows</button>
            <button type="button" [class.active]="activeTab === 'editor'" (click)="setTab('editor')">Create / Edit</button>
            <button type="button" [class.active]="activeTab === 'data'" (click)="setTab('data')">Data Table</button>
          </div>

          @if (activeTab === 'schema') {
            <section class="schema-grid reference-schema-grid">
              @for (field of table.fields; track field.key) {
                <div>
                  <strong>{{ field.label }}</strong>
                  <span>{{ field.type }}{{ field.required ? ' - required' : '' }}{{ field.readOnly ? ' - read-only' : '' }}</span>
                </div>
              }
            </section>
          }

          @if (activeTab === 'rows') {
            <section class="database-rows-view">
              <div class="rows-toolbar">
                <label class="search-field">
                  <span class="sr-only">Search rows</span>
                  <input
                    name="rowSearch"
                    [(ngModel)]="rowSearch"
                    (ngModelChange)="resetPage()"
                    placeholder="Search rows..."
                  >
                </label>
                <button class="secondary-action filter-chip" type="button">
                  <span class="filter-mini-icon" aria-hidden="true"></span>
                  <span>Filters</span>
                </button>
                @if (statusOptions().length) {
                  <select name="statusFilter" [(ngModel)]="statusFilter" (ngModelChange)="resetPage()">
                    <option value="">All statuses</option>
                    @for (status of statusOptions(); track status) {
                      <option [value]="status">{{ formatStatus(status) }}</option>
                    }
                  </select>
                }
                <button class="secondary-action clear-chip" type="button" (click)="clearFilters()">Clear</button>
                <div class="table-pager">
                  <span>{{ filteredRows().length }} rows</span>
                  <button type="button" (click)="previousPage()" [disabled]="currentPage === 1" aria-label="Previous page">
                    <span class="pager-left-icon" aria-hidden="true"></span>
                  </button>
                  <strong>{{ currentPage }}</strong>
                  <button type="button" (click)="nextPage()" [disabled]="currentPage === totalPages()" aria-label="Next page">
                    <span class="pager-right-icon" aria-hidden="true"></span>
                  </button>
                </div>
              </div>

              <div class="table-shell reference-table-shell">
                <table class="reference-table dense-row-table">
                  <thead>
                    <tr>
                      @for (field of visibleFields(table); track field.key) {
                        <th>{{ field.label }}</th>
                      }
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of pageRows(); track row.id) {
                      <tr [class.active]="row.id === selectedRow?.id">
                        @for (field of visibleFields(table); track field.key) {
                          <td>
                            @if (isStatusField(table, field)) {
                              <span class="status-badge" [ngClass]="statusBadgeClass(rowStatusValue(row))">
                                {{ formatStatus(rowStatusValue(row)) }}
                              </span>
                            } @else {
                              {{ formatCell(row[field.key], field) }}
                            }
                          </td>
                        }
                        <td>
                          <div class="row-action-group">
                            <button class="row-icon edit-row-icon" type="button" (click)="editRow(row)" title="Edit row">
                              <span class="sr-only">Edit row</span>
                            </button>
                            @if (table.delete !== false) {
                              <button class="row-icon delete-row-icon" type="button" (click)="deleteRow(row)" title="Delete row">
                                <span class="sr-only">Delete row</span>
                              </button>
                            }
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td [attr.colspan]="visibleFields(table).length + 1" class="empty">No rows match the current filters.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>
          }

          @if (activeTab === 'editor') {
            <form class="row-editor reference-editor" (ngSubmit)="save()">
              <div class="card-head">
                <div>
                  <h2>{{ selectedRow ? 'Edit row' : 'Create row' }}</h2>
                  <p>{{ selectedRow?.id || 'New record' }}</p>
                </div>
                @if (selectedRow && table.delete !== false) {
                  <button class="secondary-action danger" type="button" (click)="deleteSelected()">Delete</button>
                }
              </div>

              <div class="form-grid database-form-grid">
                @for (field of editableFields(table); track field.key) {
                  <label [class.full]="field.multiline || field.type === 'json'">
                    {{ field.label }}

                    @if (field.type === 'enum') {
                      <select [name]="field.key" [(ngModel)]="form[field.key]" [required]="field.required === true">
                        @for (option of field.enumValues || []; track option) {
                          <option [value]="option">{{ option }}</option>
                        }
                      </select>
                    } @else if (field.type === 'boolean') {
                      <select [name]="field.key" [(ngModel)]="form[field.key]" [required]="field.required === true">
                        <option [ngValue]="true">True</option>
                        <option [ngValue]="false">False</option>
                      </select>
                    } @else if (field.multiline || field.type === 'json') {
                      <textarea [name]="field.key" [(ngModel)]="form[field.key]" [required]="field.required === true"></textarea>
                    } @else {
                      <input
                        [name]="field.key"
                        [type]="inputType(field)"
                        [(ngModel)]="form[field.key]"
                        [required]="field.required === true"
                      >
                    }
                  </label>
                }
              </div>

              <div class="editor-actions">
                @if (table.update !== false || !selectedRow) {
                  <button class="primary-action" type="submit">{{ selectedRow ? 'Save changes' : 'Create row' }}</button>
                }
                @if (table.create !== false) {
                  <button class="secondary-action" type="button" (click)="startCreate()">New row</button>
                }
              </div>

              @if (message) {
                <p class="form-success">{{ message }}</p>
              }
              @if (error) {
                <p class="form-error">{{ error }}</p>
              }
            </form>
          }

          @if (activeTab === 'data') {
            <div class="table-shell reference-table-shell database-table">
              <table class="reference-table dense-row-table full-data-table">
                <thead>
                  <tr>
                    @for (field of table.fields; track field.key) {
                      <th>{{ field.label }}</th>
                    }
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of filteredRows(); track row.id) {
                    <tr [class.active]="row.id === selectedRow?.id">
                      @for (field of table.fields; track field.key) {
                        <td>{{ formatCell(row[field.key], field) }}</td>
                      }
                      <td>
                        <div class="row-action-group">
                          <button class="row-icon edit-row-icon" type="button" (click)="editRow(row)" title="Edit row">
                            <span class="sr-only">Edit row</span>
                          </button>
                          @if (table.delete !== false) {
                            <button class="row-icon delete-row-icon" type="button" (click)="deleteRow(row)" title="Delete row">
                              <span class="sr-only">Delete row</span>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td [attr.colspan]="table.fields.length + 1" class="empty">No rows loaded.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </article>
      } @else {
        <nav class="admin-breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/admin/database">Database</a>
          <span>Tables</span>
        </nav>

        <header class="admin-page-header">
          <div>
            <h1>Database</h1>
            <p>Select a table to view and manage data.</p>
          </div>
          <div class="admin-toolbar database-overview-toolbar">
            <label class="search-field">
              <span class="sr-only">Search tables</span>
              <input name="overviewSearch" [(ngModel)]="overviewSearch" placeholder="Search tables...">
            </label>
            <button class="primary-action refresh-action" type="button" (click)="reload()">
              <span class="refresh-mini-icon" aria-hidden="true"></span>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <section class="database-card-grid">
          @for (table of filteredTables(); track table.key) {
            <a class="database-table-card" [routerLink]="['/admin/database', table.key]">
              <span class="table-card-icon" aria-hidden="true"></span>
              <span class="table-card-arrow" aria-hidden="true"></span>
              <strong>{{ table.key }}</strong>
              <small>{{ tableDescription(table) }}</small>
              <span class="table-card-meta">
                <span>{{ tableRowCount(table) }} rows</span>
                <span>{{ table.fields.length }} columns</span>
              </span>
            </a>
          } @empty {
            <article class="reference-panel">
              <p class="empty">No database tables loaded.</p>
            </article>
          }
        </section>
      }
    </section>
  `
})
export class AdminDatabaseComponent implements OnInit, OnDestroy {
  tables: DatabaseTable[] = [];
  rows: DatabaseRow[] = [];
  selectedTable?: DatabaseTable;
  selectedRow?: DatabaseRow;
  form: Record<string, unknown> = {};
  message = '';
  error = '';
  overviewSearch = '';
  rowSearch = '';
  statusFilter = '';
  activeTab: DatabaseTab = 'rows';
  currentPage = 1;
  readonly pageSize = 8;
  rowCounts: Record<string, number> = {};
  private refreshSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadTables();
    this.routeSubscription = this.route.paramMap.subscribe((params) => this.applyRouteTable(params.get('tableKey')));
    this.refreshSubscription = interval(LIVE_REFRESH_INTERVAL_MS).subscribe(() => this.reload());
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  reload() {
    if (this.selectedTable) {
      this.loadRows(this.selectedTable, { resetSelection: false });
      return;
    }

    this.loadTables();
  }

  setTab(tab: DatabaseTab) {
    this.activeTab = tab;
  }

  selectTable(table: DatabaseTable) {
    this.selectedTable = table;
    this.selectedRow = undefined;
    this.form = {};
    this.message = '';
    this.error = '';
    this.rowSearch = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.activeTab = 'rows';
    this.loadRows(table, { resetSelection: true });
  }

  loadRows(table: DatabaseTable, options: LoadRowsOptions = { resetSelection: true }) {
    this.api.databaseRows(table.key).subscribe({
      next: (rows) => {
        this.rows = rows;
        this.rowCounts = { ...this.rowCounts, [table.key]: rows.length };
        this.currentPage = Math.min(this.currentPage, this.totalPages());

        if (!options.resetSelection) {
          this.syncSelectedRow(rows);
          return;
        }

        if (table.create === false && rows.length) {
          this.selectRow(rows[0]);
          return;
        }

        this.startCreate(false);
      },
      error: () => (this.error = `Could not load ${table.label}.`)
    });
  }

  startCreate(openEditor = true) {
    this.selectedRow = undefined;
    this.message = '';
    this.error = '';
    this.form = this.editableFields().reduce<Record<string, unknown>>((form, field) => {
      form[field.key] = this.defaultValue(field);
      return form;
    }, {});

    if (openEditor) {
      this.activeTab = 'editor';
    }
  }

  editRow(row: DatabaseRow) {
    this.selectRow(row);
    this.activeTab = 'editor';
  }

  save() {
    if (!this.selectedTable) {
      return;
    }

    const request = this.selectedRow
      ? this.api.updateDatabaseRow(this.selectedTable.key, this.selectedRow.id, this.form)
      : this.api.createDatabaseRow(this.selectedTable.key, this.form);

    request.subscribe({
      next: () => {
        this.message = this.selectedRow ? 'Row updated.' : 'Row created.';
        this.loadRows(this.selectedTable as DatabaseTable, { resetSelection: true });
      },
      error: (response) => {
        this.error = response?.error?.message || 'Database change failed.';
      }
    });
  }

  deleteRow(row: DatabaseRow) {
    this.selectRow(row);
    this.deleteSelected();
  }

  deleteSelected() {
    if (!this.selectedTable || !this.selectedRow || !window.confirm('Delete this row?')) {
      return;
    }

    this.api.deleteDatabaseRow(this.selectedTable.key, this.selectedRow.id).subscribe({
      next: () => {
        this.message = 'Row deleted.';
        this.loadRows(this.selectedTable as DatabaseTable, { resetSelection: true });
      },
      error: (response) => {
        this.error = response?.error?.message || 'Delete failed.';
      }
    });
  }

  filteredTables() {
    const query = this.overviewSearch.trim().toLowerCase();
    if (!query) {
      return this.tables;
    }

    return this.tables.filter((table) =>
      [table.key, table.label, this.tableDescription(table)].some((value) => value.toLowerCase().includes(query))
    );
  }

  filteredRows() {
    const query = this.rowSearch.trim().toLowerCase();
    return this.rows.filter((row) => {
      const matchesStatus = !this.statusFilter || this.rowStatusValue(row) === this.statusFilter;
      const matchesQuery =
        !query ||
        Object.values(row).some((value) => this.formatSearchValue(value).toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });
  }

  pageRows() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows().slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.max(Math.ceil(this.filteredRows().length / this.pageSize), 1);
  }

  previousPage() {
    this.currentPage = Math.max(this.currentPage - 1, 1);
  }

  nextPage() {
    this.currentPage = Math.min(this.currentPage + 1, this.totalPages());
  }

  resetPage() {
    this.currentPage = 1;
  }

  clearFilters() {
    this.rowSearch = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  statusOptions() {
    return Array.from(new Set(this.rows.map((row) => this.rowStatusValue(row)).filter(Boolean))).sort();
  }

  tableRowCount(table: DatabaseTable) {
    if (this.selectedTable?.key === table.key) {
      return this.rows.length;
    }

    return this.rowCounts[table.key] ?? 0;
  }

  tableDescription(table: DatabaseTable) {
    const descriptions: Record<string, string> = {
      users: 'System users and operators',
      customers: 'Registered customer accounts',
      'freight-services': 'Freight schedules and rates',
      'tracking-records': 'Shipment tracking records',
      'tracking-events': 'Tracking timeline events',
      'container-types': 'Container standards',
      'service-categories': 'Public service categories',
      'company-profile': 'Company information',
      'contact-messages': 'Contact form messages',
      'quote-requests': 'Customer quote requests',
      'audit-logs': 'System activity logs'
    };

    return descriptions[table.key] || `${table.fields.length} editable columns`;
  }

  editableFields(table = this.selectedTable) {
    return table?.fields.filter((field) => !field.readOnly) || [];
  }

  visibleFields(table: DatabaseTable) {
    const priority = [
      'id',
      'title',
      'name',
      'email',
      'trackingNumber',
      'action',
      'tradeLane',
      'originPort',
      'destinationPort',
      'scheduleMonth',
      'status',
      'role',
      'currentStatus',
      'active',
      'published'
    ];
    const fields = priority
      .map((key) => table.fields.find((field) => field.key === key))
      .filter((field): field is DatabaseField => Boolean(field));

    for (const field of table.fields) {
      if (fields.length >= 7) {
        break;
      }

      if (!fields.some((item) => item.key === field.key)) {
        fields.push(field);
      }
    }

    return fields;
  }

  isStatusField(table: DatabaseTable, field: DatabaseField) {
    return field.key === this.statusFieldKey(table);
  }

  rowStatusValue(row: DatabaseRow) {
    const key = this.selectedTable ? this.statusFieldKey(this.selectedTable) : undefined;
    if (!key) {
      return '';
    }

    const value = row[key];
    if (value === true) {
      return 'ACTIVE';
    }

    if (value === false) {
      return 'INACTIVE';
    }

    return value === null || value === undefined ? '' : String(value);
  }

  statusBadgeClass(value: string) {
    const normalized = value.toLowerCase();
    if (['published', 'active', 'delivered', 'resolved'].includes(normalized)) {
      return 'status-success';
    }

    if (['draft', 'new', 'booking_received', 'in_progress'].includes(normalized)) {
      return 'status-warning';
    }

    if (['archived', 'closed', 'inactive', 'private'].includes(normalized)) {
      return 'status-muted';
    }

    if (normalized === 'admin') {
      return 'status-admin';
    }

    return 'status-info';
  }

  formatStatus(value?: string) {
    if (!value) {
      return '-';
    }

    return value
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  inputType(field: DatabaseField) {
    if (field.type === 'number') {
      return 'number';
    }

    if (field.type === 'date') {
      return 'datetime-local';
    }

    return 'text';
  }

  rowTitle(row: DatabaseRow) {
    const titleField = this.selectedTable?.fields.find((field) =>
      ['title', 'name', 'email', 'trackingNumber', 'action'].includes(field.key)
    );
    return String(row[titleField?.key || 'id'] || row.id);
  }

  formatCell(value: unknown, field?: DatabaseField) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }

    if (field?.type === 'date') {
      return this.formatDateTime(String(value));
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  exportRows() {
    if (!this.selectedTable) {
      return;
    }

    const fields = this.selectedTable.fields;
    const lines = [
      fields.map((field) => this.csvValue(field.label)).join(','),
      ...this.filteredRows().map((row) => fields.map((field) => this.csvValue(row[field.key])).join(','))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.selectedTable.key}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private loadTables() {
    this.api.databaseTables().subscribe({
      next: (tables) => {
        this.tables = tables;
        this.loadOverviewCounts();
        this.applyRouteTable(this.route.snapshot.paramMap.get('tableKey'));
      },
      error: () => (this.error = 'Could not load database tables.')
    });
  }

  private loadOverviewCounts() {
    this.tables.forEach((table) => {
      this.api.databaseRows(table.key).subscribe({
        next: (rows) => (this.rowCounts = { ...this.rowCounts, [table.key]: rows.length })
      });
    });
  }

  private applyRouteTable(tableKey: string | null) {
    if (!this.tables.length) {
      return;
    }

    if (!tableKey) {
      this.selectedTable = undefined;
      this.selectedRow = undefined;
      this.rows = [];
      this.form = {};
      this.message = '';
      this.error = '';
      this.activeTab = 'rows';
      return;
    }

    const table = this.tables.find((item) => item.key === tableKey);
    if (!table) {
      this.selectedTable = undefined;
      this.rows = [];
      this.error = 'Database table not found.';
      return;
    }

    if (this.selectedTable?.key !== table.key) {
      this.selectTable(table);
      return;
    }

    this.selectedTable = table;
  }

  private selectRow(row: DatabaseRow) {
    this.selectedRow = row;
    this.message = '';
    this.error = '';
    this.form = this.editableFields().reduce<Record<string, unknown>>((form, field) => {
      form[field.key] = this.toFormValue(field, row[field.key]);
      return form;
    }, {});
  }

  private statusFieldKey(table: DatabaseTable) {
    return table.fields.find((field) =>
      ['status', 'currentStatus', 'role', 'active', 'published'].includes(field.key)
    )?.key;
  }

  private defaultValue(field: DatabaseField) {
    if (field.type === 'boolean') {
      return true;
    }

    if (field.type === 'enum') {
      return field.enumValues?.[0] || '';
    }

    return '';
  }

  private toFormValue(field: DatabaseField, value: unknown) {
    if (value === null || value === undefined) {
      return this.defaultValue(field);
    }

    if (field.type === 'date') {
      return new Date(String(value)).toISOString().slice(0, 16);
    }

    if (field.type === 'json') {
      return JSON.stringify(value, null, 2);
    }

    return value;
  }

  private syncSelectedRow(rows: DatabaseRow[]) {
    if (!this.selectedRow) {
      return;
    }

    const updatedRow = rows.find((row) => row.id === this.selectedRow?.id);
    if (updatedRow) {
      this.selectRow(updatedRow);
      return;
    }

    this.selectedRow = undefined;
    if (this.selectedTable?.create === false && rows.length) {
      this.selectRow(rows[0]);
      return;
    }

    this.startCreate(false);
  }

  private formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private formatSearchValue(value: unknown) {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private csvValue(value: unknown) {
    const text = this.formatSearchValue(value).replaceAll('"', '""');
    return `"${text}"`;
  }
}
