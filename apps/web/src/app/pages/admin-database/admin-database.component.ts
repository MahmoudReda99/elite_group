import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { DatabaseField, DatabaseRow, DatabaseTable } from '../../core/models';

@Component({
  selector: 'eg-admin-database',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Database</p>
          <h1>Inspect schemas and manage table rows.</h1>
        </div>
        <button type="button" (click)="reload()">Refresh</button>
      </header>

      <section class="database-layout">
        <aside class="tool-panel table-nav">
          <h2>Tables</h2>
          @for (table of tables; track table.key) {
            <button
              class="subtle table-nav-button"
              type="button"
              [class.active]="table.key === selectedTable?.key"
              (click)="selectTable(table)"
            >
              <span>{{ table.label }}</span>
              <small>{{ table.fields.length }} fields</small>
            </button>
          }
        </aside>

        <section class="database-main">
          @if (selectedTable) {
            <article class="tool-panel">
              <div class="card-head">
                <div>
                  <h2>{{ selectedTable.label }}</h2>
                  <p>{{ rows.length }} records loaded · {{ editableFields().length }} editable fields</p>
                </div>
                <div class="row-actions">
                  @if (selectedTable.create !== false) {
                    <button type="button" (click)="startCreate()">New row</button>
                  }
                </div>
              </div>

              <div class="schema-grid">
                @for (field of selectedTable.fields; track field.key) {
                  <div>
                    <strong>{{ field.label }}</strong>
                    <span>{{ field.type }}{{ field.required ? ' · required' : '' }}{{ field.readOnly ? ' · read-only' : '' }}</span>
                  </div>
                }
              </div>
            </article>

            <section class="database-workspace">
              <article class="tool-panel row-browser">
                <h2>Rows</h2>
                @if (!rows.length) {
                  <p class="empty">No records in this table yet.</p>
                }

                @for (row of rows; track row.id) {
                  <button
                    type="button"
                    class="row-card"
                    [class.active]="row.id === selectedRow?.id"
                    (click)="editRow(row)"
                  >
                    <strong>{{ rowTitle(row) }}</strong>
                    <span>{{ row.id }}</span>
                  </button>
                }
              </article>

              <form class="tool-panel row-editor" (ngSubmit)="save()">
                <div class="card-head">
                  <div>
                    <h2>{{ selectedRow ? 'Edit row' : 'Create row' }}</h2>
                    <p>{{ selectedRow?.id || 'New record' }}</p>
                  </div>
                  @if (selectedRow && selectedTable.delete !== false) {
                    <button class="subtle danger" type="button" (click)="deleteSelected()">Delete</button>
                  }
                </div>

                <div class="form-grid database-form-grid">
                  @for (field of editableFields(); track field.key) {
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

                @if (selectedTable.update !== false || !selectedRow) {
                  <button type="submit">{{ selectedRow ? 'Save changes' : 'Create row' }}</button>
                }

                @if (message) {
                  <p class="form-success">{{ message }}</p>
                }
                @if (error) {
                  <p class="form-error">{{ error }}</p>
                }
              </form>
            </section>

            <article class="table-shell database-table">
              <table>
                <thead>
                  <tr>
                    @for (field of selectedTable.fields; track field.key) {
                      <th>{{ field.label }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of rows; track row.id) {
                    <tr (click)="editRow(row)" [class.active]="row.id === selectedRow?.id">
                      @for (field of selectedTable.fields; track field.key) {
                        <td>{{ formatValue(row[field.key]) }}</td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </article>
          }
        </section>
      </section>
    </section>
  `
})
export class AdminDatabaseComponent implements OnInit {
  tables: DatabaseTable[] = [];
  rows: DatabaseRow[] = [];
  selectedTable?: DatabaseTable;
  selectedRow?: DatabaseRow;
  form: Record<string, unknown> = {};
  message = '';
  error = '';

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.api.databaseTables().subscribe({
      next: (tables) => {
        this.tables = tables;
        if (tables.length) {
          this.selectTable(tables[0]);
        }
      },
      error: () => (this.error = 'Could not load database tables.')
    });
  }

  reload() {
    if (this.selectedTable) {
      this.loadRows(this.selectedTable);
    }
  }

  selectTable(table: DatabaseTable) {
    this.selectedTable = table;
    this.selectedRow = undefined;
    this.form = {};
    this.message = '';
    this.error = '';
    this.loadRows(table);
  }

  loadRows(table: DatabaseTable) {
    this.api.databaseRows(table.key).subscribe({
      next: (rows) => {
        this.rows = rows;
        if (table.create === false && rows.length) {
          this.editRow(rows[0]);
        } else {
          this.startCreate();
        }
      },
      error: () => (this.error = `Could not load ${table.label}.`)
    });
  }

  startCreate() {
    this.selectedRow = undefined;
    this.message = '';
    this.error = '';
    this.form = this.editableFields().reduce<Record<string, unknown>>((form, field) => {
      form[field.key] = this.defaultValue(field);
      return form;
    }, {});
  }

  editRow(row: DatabaseRow) {
    this.selectedRow = row;
    this.message = '';
    this.error = '';
    this.form = this.editableFields().reduce<Record<string, unknown>>((form, field) => {
      form[field.key] = this.toFormValue(field, row[field.key]);
      return form;
    }, {});
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
        this.loadRows(this.selectedTable as DatabaseTable);
      },
      error: (response) => {
        this.error = response?.error?.message || 'Database change failed.';
      }
    });
  }

  deleteSelected() {
    if (!this.selectedTable || !this.selectedRow || !window.confirm('Delete this row?')) {
      return;
    }

    this.api.deleteDatabaseRow(this.selectedTable.key, this.selectedRow.id).subscribe({
      next: () => {
        this.message = 'Row deleted.';
        this.loadRows(this.selectedTable as DatabaseTable);
      },
      error: (response) => {
        this.error = response?.error?.message || 'Delete failed.';
      }
    });
  }

  editableFields() {
    return this.selectedTable?.fields.filter((field) => !field.readOnly) || [];
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

  formatValue(value: unknown) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
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
}
